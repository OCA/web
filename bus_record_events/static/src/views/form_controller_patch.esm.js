import {useBus, useService} from "@web/core/utils/hooks";
import {FormController} from "@web/views/form/form_controller";
import {_t} from "@web/core/l10n/translation";
import {patch} from "@web/core/utils/patch";
import {useRecordHighlights} from "./record_highlights.esm";
import {useRecordStream} from "../hooks/use_record_stream.esm";

patch(FormController.prototype, {
    setup() {
        super.setup(...arguments);
        this.recordEventsNotification = useService("notification");
        // Text typed in a field is not in the record until the field commits
        // it. ``record.isDirty()`` would commit it, which parses half-typed
        // input and runs onchanges under the user's cursor; the field reports
        // the typing on the model bus instead, as the save indicator uses it.
        this.recordEventsFieldIsDirty = false;
        useBus(this.model.bus, "FIELD_IS_DIRTY", (ev) => {
            this.recordEventsFieldIsDirty = ev.detail;
        });
        const reloadWithHighlights = useRecordHighlights(this.model, {
            announce: true,
            // The record reloads itself in the model's mutex, after any save or
            // onchange, and stays the root that running code holds.
            // ``model.load()`` would build a new root and go through the
            // KeepLast that a view button's own reload is waiting on.
            load: () => this.model.root.load(),
        });
        useRecordStream(this.props.resModel, {
            isLoading: () => this.model.busRecordEventsLoading,
            getResId: () => !this.model.root.isNew && this.model.root.resId,
            isBusy: async () => this._recordEventsHasUnsavedChanges(),
            onBusy: () =>
                this.recordEventsNotification.add(
                    _t(
                        "This record was changed by someone else. It will refresh once you save or discard your changes."
                    ),
                    {type: "warning"}
                ),
            onReload: async (changes) => {
                // An event too large to list its ids may have deleted this
                // record, and reloading a deleted record fails.
                if (changes.all && !(await this._recordEventsRecordExists())) {
                    return this._onRecordDeletedElsewhere();
                }
                return reloadWithHighlights(changes);
            },
            onDeleted: () => this._onRecordDeletedElsewhere(),
            minInterval: 0,
        });
    },

    _recordEventsHasUnsavedChanges() {
        return this.model.root.dirty || this.recordEventsFieldIsDirty;
    },

    async _recordEventsRecordExists() {
        const {resId} = this.model.root;
        const count = await this.orm.searchCount(
            this.props.resModel,
            [["id", "=", resId]],
            {
                context: {active_test: false},
            }
        );
        return count > 0;
    },

    async _onRecordDeletedElsewhere() {
        if (this._recordEventsHasUnsavedChanges()) {
            this.recordEventsNotification.add(
                _t(
                    "This record was deleted by someone else. Your changes cannot be saved."
                ),
                {type: "danger", sticky: true}
            );
            return;
        }
        this.recordEventsNotification.add(
            _t("This record was deleted by someone else."),
            {
                type: "warning",
            }
        );
        if (!this.env.inDialog) {
            this.env.config.historyBack?.();
        }
    },
});

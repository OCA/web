import {FormController} from "@web/views/form/form_controller";
import {_t} from "@web/core/l10n/translation";
import {patch} from "@web/core/utils/patch";
import {useRecordHighlights} from "./record_highlights.esm";
import {useRecordStream} from "../hooks/use_record_stream.esm";
import {useService} from "@web/core/utils/hooks";

patch(FormController.prototype, {
    setup() {
        super.setup(...arguments);
        this.recordEventsNotification = useService("notification");
        useRecordStream(this.props.resModel, {
            isLoading: () => this.model.busRecordEventsLoading,
            getResId: () => !this.model.root.isNew && this.model.root.resId,
            isBusy: () => this.model.root.isDirty(),
            onBusy: () =>
                this.recordEventsNotification.add(
                    _t(
                        "This record was changed by someone else. It will refresh once you save or discard your changes."
                    ),
                    {type: "warning"}
                ),
            // The record reloads itself in the model's mutex, after any save
            // or onchange, and stays the root that running code holds.
            // ``model.load()`` would build a new root and go through the
            // KeepLast that a view button's own reload is waiting on.
            onReload: useRecordHighlights(this.model, {
                announce: true,
                load: () => this.model.root.load(),
            }),
            onDeleted: () => this._onRecordDeletedElsewhere(),
            minInterval: 0,
        });
    },

    async _onRecordDeletedElsewhere() {
        if (await this.model.root.isDirty()) {
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

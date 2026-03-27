/** @odoo-module alias=web_timeline.TimelineController **/
/**
 * Copyright 2023 Onestein - Anjeel Haria
 * Copyright 2024 Tecnativa - Carlos López
 * License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl).
 */
import {Component, useRef} from "@odoo/owl";
import {ConfirmationDialog} from "@web/core/confirmation_dialog/confirmation_dialog";
import {FormViewDialog} from "@web/views/view_dialogs/form_view_dialog";
import {Layout} from "@web/search/layout";
import {SearchBar} from "@web/search/search_bar/search_bar";
import {_t} from "@web/core/l10n/translation";
import {makeContext} from "@web/core/context";
import {standardViewProps} from "@web/views/standard_view_props";
import {useDebounced} from "@web/core/utils/timing";
import {useModel} from "@web/model/model";
import {useSearchBarToggler} from "@web/search/search_bar/search_bar_toggler";
import {useService} from "@web/core/utils/hooks";
import {useSetupView} from "@web/views/view_hook";

const {DateTime} = luxon;

// Import time from "web.time";

export class TimelineController extends Component {
    /**
     * @override
     */
    setup() {
        this.rootRef = useRef("root");
        this.model = useModel(this.props.Model, this.props.modelParams);
        useSetupView({rootRef: useRef("root")});
        this.searchBarToggler = useSearchBarToggler();
        this.date_start = this.props.modelParams.date_start;
        this.date_stop = this.props.modelParams.date_stop;
        this.date_delay = this.props.modelParams.date_delay;
        this.open_popup_action = this.props.modelParams.open_popup_action;
        this.moveQueue = [];
        this.debouncedInternalMove = useDebounced(this.internalMove, 0);
        this.dialogService = useService("dialog");
        this.actionService = useService("action");
    }
    get rendererProps() {
        return {
            model: this.model,
            onAdd: this._onAdd.bind(this),
            onGroupClick: this._onGroupClick.bind(this),
            onItemDoubleClick: this._onItemDoubleClick.bind(this),
            onMove: this._onMove.bind(this),
            onRemove: this._onRemove.bind(this),
            onUpdate: this._onUpdate.bind(this),
        };
    }
    getSearchProps() {
        const {comparision, context, domain, groupBy, orderBy} = this.env.searchModel;
        return {comparision, context, domain, groupBy, orderBy};
    }
    /**
     * Gets triggered when a group in the timeline is
     * clicked (by the TimelineRenderer).
     *
     * @private
     * @param {EventObject} item
     */
    _onGroupClick(item) {
        try {
            const groupPathSegments = JSON.parse(item.group);
            if (!Array.isArray(groupPathSegments) || groupPathSegments.length === 0)
                return;

            const lastSegment = groupPathSegments[groupPathSegments.length - 1];
            const group_key = lastSegment.field;
            const group_value = lastSegment.value;

            if (
                group_value === false ||
                group_value === null ||
                group_value === undefined
            )
                return;

            const fieldInfo = this.model.fields[group_key];
            if (!fieldInfo || !fieldInfo.relation) return;

            this.actionService.doAction({
                type: "ir.actions.act_window",
                res_model: fieldInfo.relation,
                res_id: parseInt(group_value, 10),
                views: [[false, "form"]],
                view_mode: "form",
                target: "new",
            });
        } catch (e) {
            console.error("Error parsing group JSON for click event:", item.group, e);
        }
    }

    /**
     * Triggered on double-click on an item in read-only mode (otherwise, we use _onUpdate).
     *
     * @private
     * @param {EventObject} event
     * @returns {jQuery.Deferred}
     */
    _onItemDoubleClick(event) {
        const item_id = event.item.split("_")[0];
        return this.openItem(Number(item_id) || item_id, false);
    }

    /**
     * Opens a form view of a clicked timeline
     * item (triggered by the TimelineRenderer).
     *
     * @private
     * @param {Object} item
     * @returns {Object}
     */
    _onUpdate(item) {
        const item_id = Number(item.evt.id) || item.evt.id;
        return this.openItem(item_id, true);
    }

    /** Open specified item, either through modal, or by navigating to form view.
     * @param {Integer} item_id
     * @param {Boolean} is_editable
     */
    openItem(item_id, is_editable) {
        if (this.open_popup_action) {
            const options = {
                resModel: this.model.model_name,
                resId: item_id,
            };
            if (is_editable) {
                options.onRecordSaved = async () => {
                    await this.model.load(this.getSearchProps());
                    this.render();
                };
            } else {
                options.preventEdit = true;
            }
            this.Dialog = this.dialogService.add(FormViewDialog, options, {});
        } else {
            this.env.services.action.switchView("form", {
                resId: item_id,
                mode: is_editable ? "edit" : "readonly",
            });
        }
    }

    /**
     * Gets triggered when a timeline item is
     * moved (triggered by the TimelineRenderer).
     *
     * @private
     * @param {Object} item
     * @param {Function} callback
     */
    _onMove(item, callback) {
        const event_start = DateTime.fromJSDate(item.start);
        const event_end = item.end ? DateTime.fromJSDate(item.end) : false;
        const data = {};
        // In case of a move event, the date_delay stay the same,
        // only date_start and stop must be updated
        data[this.date_start] = this.model.serializeDate(this.date_start, event_start);
        if (this.date_stop) {
            // In case of instantaneous event, item.end is not defined
            if (event_end) {
                data[this.date_stop] = this.model.serializeDate(
                    this.date_stop,
                    event_end
                );
            } else {
                data[this.date_stop] = data[this.date_start];
            }
        }
        if (this.date_delay && event_end) {
            const diff = event_end.diff(event_start, "hours");
            data[this.date_delay] = diff.hours;
        }

        // Parse the group JSON to extract field values for all group levels
        if (item.group) {
            try {
                const groupPathSegments = JSON.parse(item.group);
                if (Array.isArray(groupPathSegments)) {
                    for (const segment of groupPathSegments) {
                        // Skip m2m fields as they are complicated to handle
                        if (
                            this.model.fields[segment.field] &&
                            this.model.fields[segment.field].type === "many2many"
                        ) {
                            continue;
                        }
                        // Skip date and datetime fields
                        if (
                            this.model.fields[segment.field] &&
                            (this.model.fields[segment.field].type === "date" ||
                                this.model.fields[segment.field].type === "datetime")
                        ) {
                            continue;
                        }
                        if (
                            segment.value !== false &&
                            segment.value !== null &&
                            segment.value !== undefined
                        ) {
                            data[segment.field] = segment.value;
                        } else {
                            data[segment.field] = false;
                        }
                    }
                }
            } catch (e) {
                console.error(
                    "Error parsing group JSON for move event:",
                    item.group,
                    e
                );
            }
        }

        this.moveQueue.push({
            id: item.record_id,
            data,
            item,
            callback,
        });
        this.debouncedInternalMove();
    }
    /**
     * Write enqueued moves to Odoo. After all writes are finished it updates
     * the view once (prevents flickering of the view when multiple timeline items
     * are moved at once).
     *
     * @returns {jQuery.Deferred}
     */
    async internalMove() {
        const queues = this.moveQueue.slice();
        this.moveQueue = [];
        for (const item of queues) {
            await this.model.write_completed(item.id, item.data);
            item.callback(item.item);
        }
        await this.model.load(this.getSearchProps());
        this.render();
    }

    /**
     * Triggered when a timeline item gets removed from the view.
     * Requires user confirmation before it gets actually deleted.
     *
     * @private
     * @param {Object} item
     * @param {Function} callback
     */
    _onRemove(item, callback) {
        this.dialogService.add(ConfirmationDialog, {
            title: _t("Warning"),
            body: _t("Are you sure you want to delete this record?"),
            confirmLabel: _t("Confirm"),
            cancelLabel: _t("Discard"),
            confirm: async () => {
                // Use record_id for deletion, not the composite id
                await this.model.remove_completed({...item, id: item.record_id});
                callback(item);
            },
            cancel: () => {
                return;
            },
        });
    }

    /**
     * Triggered when a timeline item gets added and opens a form view.
     *
     * @private
     * @param {Object} item
     * @param {Function} callback
     */
    _onAdd(item, callback) {
        // Initialize default values for creation
        const context = {};
        let item_start = false,
            item_end = false;
        item_start = DateTime.fromJSDate(item.start);
        context[`default_${this.date_start}`] = this.model.serializeDate(
            this.date_start,
            item_start
        );
        if (this.date_delay) {
            context[`default_${this.date_delay}`] = 1;
        }
        if (this.date_stop && item.end) {
            item_end = DateTime.fromJSDate(item.end);
            context[`default_${this.date_stop}`] = this.model.serializeDate(
                this.date_stop,
                item_end
            );
        }
        if (this.date_delay && this.date_stop && item_end) {
            const diff = item_end.diff(item_start, "hours");
            context[`default_${this.date_delay}`] = diff.hours;
        }
        if (item.group) {
            try {
                const groupPathSegments = JSON.parse(item.group);
                if (Array.isArray(groupPathSegments)) {
                    groupPathSegments.forEach((segment) => {
                        // Set m2m fields using command format [(6, 0, [id])]
                        if (
                            this.model.fields[segment.field] &&
                            this.model.fields[segment.field].type === "many2many"
                        ) {
                            if (
                                segment.value !== false &&
                                segment.value !== null &&
                                segment.value !== undefined
                            ) {
                                context[`default_${segment.field}`] = [
                                    [6, 0, [segment.value]],
                                ];
                            }
                            return;
                        }
                        if (
                            segment.value !== false &&
                            segment.value !== null &&
                            segment.value !== undefined
                        ) {
                            context[`default_${segment.field}`] = Number.isInteger(
                                segment.value
                            )
                                ? segment.value
                                : segment.value;
                        }
                    });
                }
            } catch (e) {
                console.error("Error parsing group JSON for add event:", item.group, e);
            }
        }
        // Show popup
        this.dialogService.add(
            FormViewDialog,
            {
                resId: false,
                context: makeContext([context], this.env.searchModel.context),
                onRecordSaved: async (record) => {
                    const new_record = await this.model.create_completed(record.resId);
                    callback(new_record);
                },
                resModel: this.model.model_name,
            },
            {onClose: () => callback()}
        );
    }
}
TimelineController.template = "web_timeline.TimelineView";
TimelineController.components = {Layout, SearchBar};
TimelineController.props = {
    ...standardViewProps,
    Model: Function,
    modelParams: Object,
    Renderer: Function,
};

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
import {useSetupAction} from "@web/search/action_hook";

const {DateTime} = luxon;

export class TimelineController extends Component {
    /**
     * @override
     */
    setup() {
        this.rootRef = useRef("root");
        this.model = useModel(this.props.Model, this.props.modelParams);
        useSetupAction({rootRef: useRef("root")});
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
        const groupField = this.model.last_group_bys[0];
        this.actionService.doAction({
            type: "ir.actions.act_window",
            res_model: this.model.fields[groupField].relation,
            res_id: item.group,
            views: [[false, "form"]],
            view_mode: "form",
            target: "new",
        });
    }

    /**
     * Triggered on double-click on an item in read-only mode (otherwise, we use _onUpdate).
     *
     * @private
     * @param {EventObject} event
     * @returns {jQuery.Deferred}
     */
    _onItemDoubleClick(event) {
        return this.openItem(event.item, false);
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
        let group = false;
        if (item.group !== -1) {
            group = item.group;
        }
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
        const grouped_field = this.model.last_group_bys[0];
        if (this.model.fields[grouped_field].type !== "many2many") {
            data[grouped_field] = group;
        }
        this.moveQueue.push({
            id: item.id,
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
                await this.model.remove_completed(item);
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
        if (item.group > 0) {
            context[`default_${this.model.last_group_bys[0]}`] = item.group;
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

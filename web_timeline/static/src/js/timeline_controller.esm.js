/** @odoo-module alias=web_timeline.TimelineController **/
/* Copyright 2023 Onestein - Anjeel Haria
 * License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl). */
import AbstractController from "web.AbstractController";
import {Component} from "@odoo/owl";
import Dialog from "web.Dialog";
import {FormViewDialog} from "@web/views/view_dialogs/form_view_dialog";
import core from "web.core";
import field_utils from "web.field_utils";
import time from "web.time";
var _t = core._t;

export default AbstractController.extend({
    custom_events: _.extend({}, AbstractController.prototype.custom_events, {
        onGroupClick: "_onGroupClick",
        onItemDoubleClick: "_onItemDoubleClick",
        onUpdate: "_onUpdate",
        onRemove: "_onRemove",
        onMove: "_onMove",
        onAdd: "_onAdd",
    }),

    /**
     * @override
     */
    init: function (parent, model, renderer, params) {
        this._super.apply(this, arguments);
        this.open_popup_action = params.open_popup_action;
        this.date_start = params.date_start;
        this.date_stop = params.date_stop;
        this.date_delay = params.date_delay;
        this.context = params.actionContext;
        this.moveQueue = [];
        this.debouncedInternalMove = _.debounce(this.internalMove, 0);
    },
    on_detach_callback() {
        if (this.Dialog) {
            this.Dialog();
            this.Dialog = undefined;
        }
        return this._super.apply(this, arguments);
    },
    /**
     * @override
     */
    update: function (params, options) {
        const res = this._super.apply(this, arguments);
        if (_.isEmpty(params)) {
            return res;
        }
        const defaults = _.defaults({}, options, {
            adjust_window: true,
        });
        const domains = params.domain || this.renderer.last_domains || [];

        // Determine the group_by specifiers to use
        const current_group_bys_specifiers =
            params.groupBy || this.renderer.last_group_bys || [];
        const arch_default_specifiers = this.renderer.arch.attrs.default_group_by
            ? this.renderer.arch.attrs.default_group_by.split(",")
            : [];

        let final_group_bys_specifiers = [];
        if (current_group_bys_specifiers.length > 0) {
            final_group_bys_specifiers = current_group_bys_specifiers;
        } else if (arch_default_specifiers.length > 0) {
            final_group_bys_specifiers = arch_default_specifiers;
        }

        // Store actual specifiers
        this.renderer.last_group_bys = final_group_bys_specifiers;
        this.renderer.last_domains = domains;

        // For the `fields` argument of search_read, we need these specifiers.
        const group_bys_date_fields = final_group_bys_specifiers.filter(
            (spec) =>
                spec.includes(":") &&
                (spec.includes(":year") ||
                    spec.includes(":quarter") ||
                    spec.includes(":month") ||
                    spec.includes(":week") ||
                    spec.includes(":day"))
        );
        const groups_bys_field_names = final_group_bys_specifiers.map(
            (spec) => spec.split(":")[0]
        );
        const fields_for_search_read = _.uniq([
            ...this.renderer.fieldNames,
            ...groups_bys_field_names,
        ]);

        // For the `order` argument of search_read, Odoo expects base field names.
        // Use arch_default_specifiers for ordering, cleaned to base names.
        const arch_default_base_names_for_order = arch_default_specifiers.map((gb) =>
            gb.includes(":") ? gb.split(":")[0] : gb
        );

        $.when(
            res,
            this._rpc({
                model: this.model.modelName,
                method: "search_read",
                kwargs: {
                    // Use specifiers for fields to read
                    fields: fields_for_search_read,
                    domain: domains,
                    order: arch_default_base_names_for_order.map((group) => {
                        // Order by base names from arch default
                        return {name: group};
                    }),
                },
                context: this.getSession().user_context,
            }).then((data) => {
                // Transform date fields for grouping
                for (const d of data) {
                    for (const date_group of group_bys_date_fields) {
                        const base_field = date_group.split(":")[0];
                        const date_value = d[base_field];
                        if (date_value) {
                            d[date_group] = this._getGroupedDate(
                                date_group,
                                date_value
                            );
                        }
                    }
                }
                // Render
                this.renderer.on_data_loaded(
                    data,
                    final_group_bys_specifiers,
                    defaults.adjust_window
                );
            })
        );
        return res;
    },

    /**
     * Get the grouped date value for a given date, based on the group type.
     * @param {String} date_group The date group specifier (e.g., 'date_start:month').
     * @param {String} date_value The date value to be grouped.
     * @returns {String|Number} The grouped date value.
     */
    _getGroupedDate: function (date_group, date_value) {
        const user_datetime = field_utils.parse.datetime(date_value);
        const group_type = date_group.split(":")[1];
        // Convert datetime to year, quarter, month, week, day with format:
        //  2024, Q2 2024, June 2024, W24 2024, 13 Jun 2024
        if (group_type === "year") {
            return user_datetime.year();
        } else if (group_type === "quarter") {
            return "Q" + user_datetime.quarter() + " " + user_datetime.year();
        } else if (group_type === "month") {
            return user_datetime.format("MMMM YYYY");
        } else if (group_type === "week") {
            return "W" + user_datetime.isoWeek() + " " + user_datetime.year();
        } else if (group_type === "day") {
            return user_datetime.format("DD MMM YYYY");
        }
    },

    /**
     * Gets triggered when a group in the timeline is
     * clicked (by the TimelineRenderer).
     *
     * @private
     * @param {EventObject} event
     * @returns {jQuery.Deferred}
     */
    _onGroupClick: function (event) {
        try {
            const groupPathSegments = JSON.parse(event.data.item.group);
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

            const fieldInfo = this.renderer.fields[group_key];
            if (!fieldInfo || !fieldInfo.relation) return;
            const group_model = fieldInfo.relation;

            return this.do_action({
                type: "ir.actions.act_window",
                res_model: group_model,
                // Assuming value is the ID
                res_id: parseInt(group_value, 10),
                target: "new",
                views: [[false, "form"]],
            });
        } catch (e) {
            console.error(
                "Error parsing group JSON for click event:",
                event.data.item.group,
                e
            );
            return Promise.resolve();
        }
    },

    /**
     * Triggered on double-click on an item in read-only mode (otherwise, we use _onUpdate).
     *
     * @private
     * @param {EventObject} event
     * @returns {jQuery.Deferred}
     */
    _onItemDoubleClick: function (event) {
        const item_id = event.data.item.split("_")[0];
        return this.openItem(Number(item_id) || item_id, false);
    },

    /**
     * Opens a form view of a clicked timeline
     * item (triggered by the TimelineRenderer).
     *
     * @private
     * @param {EventObject} event
     * @returns {jQuery.Deferred}
     */
    _onUpdate: function (event) {
        const item = event.data.item;
        const item_id = Number(item.evt.id) || item.evt.id;
        return this.openItem(item_id, true);
    },

    /** Open specified item, either through modal, or by navigating to form view.
     * @param {Number} item_id
     * @param {Boolean} is_editable
     * @returns {void}
     */
    openItem: function (item_id, is_editable) {
        if (this.open_popup_action) {
            const options = {
                resModel: this.model.modelName,
                resId: item_id,
                context: this.getSession().user_context,
            };
            if (is_editable) {
                options.onRecordSaved = () => this.write_completed();
            } else {
                options.preventEdit = true;
            }
            this.Dialog = Component.env.services.dialog.add(
                FormViewDialog,
                options,
                {}
            );
        } else {
            this.trigger_up("switch_view", {
                view_type: "form",
                model: this.model.modelName,
                res_id: item_id,
                mode: is_editable ? "edit" : "readonly",
            });
        }
    },

    /**
     * Gets triggered when a timeline item is
     * moved (triggered by the TimelineRenderer).
     *
     * @private
     * @param {EventObject} event
     */
    _onMove: function (event) {
        const item = event.data.item;
        const fields = this.renderer.fields;
        const event_start = item.start;
        const event_end = item.end;
        let data = {};
        // In case of a move event, the date_delay stay the same,
        // only date_start and stop must be updated
        data[this.date_start] = time.auto_date_to_str(
            event_start,
            fields[this.date_start].type
        );
        if (this.date_stop) {
            // In case of instantaneous event, item.end is not defined
            if (event_end) {
                data[this.date_stop] = time.auto_date_to_str(
                    event_end,
                    fields[this.date_stop].type
                );
            } else {
                data[this.date_stop] = data[this.date_start];
            }
        }
        if (this.date_delay && event_end) {
            const diff_seconds = Math.round(
                (event_end.getTime() - event_start.getTime()) / 1000
            );
            data[this.date_delay] = diff_seconds / 3600;
        }

        const group_record_values = {};
        if (item.group && this.renderer.groups) {
            const groupInfo = this.renderer.groups.find((g) => g.id === item.group);
            if (groupInfo && groupInfo.group_record_values) {
                // Skip date and datetime fields
                for (const key of Object.keys(groupInfo.group_record_values)) {
                    if (
                        fields[key] &&
                        (fields[key].type === "date" || fields[key].type === "datetime")
                    ) {
                        continue;
                    }
                    group_record_values[key] = groupInfo.group_record_values[key];
                }
            }
        }

        data = {
            ...data,
            ...group_record_values,
        };

        this.moveQueue.push({
            id: event.data.item.id,
            data: data,
            event: event,
        });

        this.debouncedInternalMove();
    },

    /**
     * Write enqueued moves to Odoo. After all writes are finished it updates
     * the view once (prevents flickering of the view when multiple timeline items
     * are moved at once).
     *
     * @returns {jQuery.Deferred}
     */
    internalMove: function () {
        const queues = this.moveQueue.slice();
        this.moveQueue = [];
        const defers = [];
        for (const item of queues) {
            defers.push(
                this._rpc({
                    model: this.model.modelName,
                    method: "write",
                    args: [[item.event.data.item.record_id], item.data],
                    context: this.getSession().user_context,
                }).then(() => {
                    item.event.data.callback(item.event.data.item);
                })
            );
        }
        return $.when.apply($, defers).done(() => {
            this.write_completed({
                adjust_window: false,
            });
        });
    },

    /**
     * Triggered when a timeline item gets removed from the view.
     * Requires user confirmation before it gets actually deleted.
     *
     * @private
     * @param {EventObject} event
     * @returns {jQuery.Deferred}
     */
    _onRemove: function (event) {
        var def = $.Deferred();

        Dialog.confirm(this, _t("Are you sure you want to delete this record?"), {
            title: _t("Warning"),
            confirm_callback: () => {
                this.remove_completed(event).then(def.resolve.bind(def));
            },
            cancel_callback: def.resolve.bind(def),
        });

        return def;
    },

    /**
     * Triggered when a timeline item gets added and opens a form view.
     *
     * @private
     * @param {EventObject} event
     * @returns {dialogs.FormViewDialog}
     */
    _onAdd: function (event) {
        const item = event.data.item;
        // Initialize default values for creation
        const default_context = {};
        default_context["default_".concat(this.date_start)] = item.start;
        if (this.date_delay) {
            default_context["default_".concat(this.date_delay)] = 1;
        }
        if (this.date_start) {
            default_context["default_".concat(this.date_start)] = moment(item.start)
                .utc()
                .format("YYYY-MM-DD HH:mm:ss");
        }
        if (this.date_stop && item.end) {
            default_context["default_".concat(this.date_stop)] = moment(item.end)
                .utc()
                .format("YYYY-MM-DD HH:mm:ss");
        }
        if (this.date_delay && this.date_start && this.date_stop && item.end) {
            default_context["default_".concat(this.date_delay)] =
                (moment(item.end) - moment(item.start)) / 3600000;
        }
        if (item.group) {
            try {
                const groupPathSegments = JSON.parse(item.group);
                if (Array.isArray(groupPathSegments)) {
                    groupPathSegments.forEach((segment) => {
                        // Do not set m2m fields as default context as they are not single values
                        if (
                            this.renderer.fields[segment.field] &&
                            this.renderer.fields[segment.field].type === "many2many"
                        ) {
                            return;
                        }
                        if (
                            segment.value !== false &&
                            segment.value !== null &&
                            segment.value !== undefined
                        ) {
                            default_context["default_".concat(segment.field)] =
                                Number.isInteger(segment.value)
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
        this.Dialog = Component.env.services.dialog.add(
            FormViewDialog,
            {
                resId: false,
                context: _.extend(default_context, this.context),
                onRecordSaved: (record) => this.create_completed([record.resId]),
                resModel: this.model.modelName,
            },
            {onClose: () => event.data.callback()}
        );
        return false;
    },

    /**
     * Triggered upon completion of a new record.
     * Updates the timeline view with the new record.
     *
     * @param {RecordId} id
     * @returns {jQuery.Deferred}
     */
    create_completed: function (id) {
        return this._rpc({
            model: this.model.modelName,
            method: "read",
            args: [id, this.model.fieldNames],
            context: this.context,
        }).then((records) => {
            var new_event = this.renderer.event_data_transform(records[0]);
            var items = this.renderer.timeline.itemsData;
            items.add(new_event);
        });
    },

    /**
     * Triggered upon completion of writing a record.
     * @param {ControllerOptions} options
     */
    write_completed: function (options) {
        const params = {
            domain: this.renderer.last_domains,
            context: this.context,
            groupBy: this.renderer.last_group_bys,
        };
        this.update(params, options);
    },

    /**
     * Triggered upon confirm of removing a record.
     * @param {EventObject} event
     * @returns {jQuery.Deferred}
     */
    remove_completed: function (event) {
        return this._rpc({
            model: this.modelName,
            method: "unlink",
            args: [[event.data.item.record_id]],
            context: this.getSession().user_context,
        }).then(() => {
            let unlink_index = false;
            for (var i = 0; i < this.model.data.data.length; i++) {
                if (this.model.data.data[i].id === event.data.item.record_id) {
                    unlink_index = i;
                }
            }
            if (!isNaN(unlink_index)) {
                this.model.data.data.splice(unlink_index, 1);
            }
            event.data.callback(event.data.item);
        });
    },
});

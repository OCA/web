odoo.define("web_timeline.TimelineController", function (require) {
    "use strict";

    const AbstractController = require("web.AbstractController");
    const dialogs = require("web.view_dialogs");
    const core = require("web.core");
    const time = require("web.time");
    const Dialog = require("web.Dialog");

    const _t = core._t;

    const TimelineController = AbstractController.extend({
        custom_events: _.extend({}, AbstractController.prototype.custom_events, {
            onGroupClick: "_onGroupClick",
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
            const domains = params.domain;
            const contexts = params.context;
            const group_bys = params.groupBy;
            this.last_domains = domains;
            this.last_contexts = contexts;
            // Select the group by
            let n_group_bys = group_bys || [];
            if (!n_group_bys.length && this.renderer.arch.attrs.default_group_by) {
                n_group_bys = this.renderer.arch.attrs.default_group_by.split(",");
            }
            this.renderer.last_group_bys = n_group_bys;
            this.renderer.last_domains = domains;

            let fields = this.renderer.fieldNames;
            fields = _.uniq(fields.concat(n_group_bys));
            return $.when(
                res,
                this._rpc({
                    model: this.model.modelName,
                    method: "search_read",
                    kwargs: {
                        fields: fields,
                        domain: domains,
                        order: [{name: this.renderer.arch.attrs.default_group_by}],
                    },
                    context: this.getSession().user_context,
                }).then((data) =>
                    this.renderer.on_data_loaded(
                        data,
                        n_group_bys,
                        defaults.adjust_window
                    )
                )
            );
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
            const groupField = this.renderer.last_group_bys[0];
            return this.do_action({
                type: "ir.actions.act_window",
                res_model: this.renderer.fields[groupField].relation,
                res_id: event.data.item.group,
                target: "new",
                views: [[false, "form"]],
            });
        },

        /**
         * Opens a form view of a clicked timeline
         * item (triggered by the TimelineRenderer).
         *
         * @private
         * @param {EventObject} event
         */
        _onUpdate: function (event) {
            this.renderer = event.data.renderer;
            const rights = event.data.rights;
            const item = event.data.item;
            const id = Number(item.evt.id) || item.evt.id;
            const title = item.evt.__name;
            if (this.open_popup_action) {
                new dialogs.FormViewDialog(this, {
                    res_model: this.model.modelName,
                    res_id: id,
                    context: this.getSession().user_context,
                    title: title,
                    view_id: Number(this.open_popup_action),
                    on_saved: () => {
                        this.write_completed();
                    },
                }).open();
            } else {
                let mode = "readonly";
                if (rights.write) {
                    mode = "edit";
                }
                this.trigger_up("switch_view", {
                    view_type: "form",
                    res_id: id,
                    mode: mode,
                    model: this.model.modelName,
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
            let group = false;
            if (item.group !== -1) {
                group = item.group;
            }
            const data = {};
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
            if (
                this.renderer.last_group_bys &&
                this.renderer.last_group_bys instanceof Array
            ) {
                data[this.renderer.last_group_bys[0]] = group;
            }

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
                        args: [[item.event.data.item.id], item.data],
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
                    .add(1, "hours")
                    .format("YYYY-MM-DD HH:mm:ss");
            }
            if (this.date_stop && item.end) {
                default_context["default_".concat(this.date_stop)] = moment(item.end)
                    .add(1, "hours")
                    .format("YYYY-MM-DD HH:mm:ss");
            }
            if (item.group > 0) {
                default_context["default_".concat(this.renderer.last_group_bys[0])] =
                    item.group;
            }
            // Show popup
            new dialogs.FormViewDialog(this, {
                res_model: this.model.modelName,
                res_id: null,
                context: _.extend(default_context, this.context),
                view_id: Number(this.open_popup_action),
                on_saved: (record) => {
                    this.create_completed([record.res_id]);
                },
            })
                .open()
                .on("closed", this, () => {
                    event.data.callback();
                });

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
                this.renderer.timeline.setItems(items);
                this.reload();
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
                args: [[event.data.item.id]],
                context: this.getSession().user_context,
            }).then(() => {
                let unlink_index = false;
                for (var i = 0; i < this.model.data.data.length; i++) {
                    if (this.model.data.data[i].id === event.data.item.id) {
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

    return TimelineController;
});

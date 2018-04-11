odoo.define('web_timeline.TimelineController', function (require) {
"use strict";

var AbstractController = require('web.AbstractController');
var QuickCreate = require('web.CalendarQuickCreate');
var dialogs = require('web.view_dialogs');
var Dialog = require('web.Dialog');
var core = require('web.core');
var time = require('web.time');

var _t = core._t;
var QWeb = core.qweb;

var CalendarController = AbstractController.extend({
    custom_events: _.extend({}, AbstractController.prototype.custom_events, {
        onUpdate: '_onUpdate',
        onRemove: '_onRemove',
        onMove: '_onMove',
        onAdd: '_onAdd',
    }),
    /**
     * @override
     * @param {Widget} parent
     * @param {AbstractModel} model
     * @param {AbstractRenderer} renderer
     * @param {Object} params
     */
    init: function (parent, model, renderer, params) {
        this._super.apply(this, arguments);
        this.open_popup_action = params.open_popup_action;
        this.date_start = params.date_start;
        this.date_stop = params.date_stop;
        this.date_delay = params.date_delay;
    },

    _onUpdate: function(event) {
        var self = this;
        this.renderer = event.data.renderer;
        var rights = event.data.rights;
        var item = event.data.item;
        var callback = event.data.callback;
        var id = item.evt.id;
        var title = item.evt.__name;
        if (!this.open_popup_action) {
            mode = 'readonly';
            if (rights.write) {
                mode = 'edit';
            }
            this.trigger_up('switch_view', {
                view_type: 'form',
                res_id: parseInt(id).toString() == id ? parseInt(id) : id,
                mode: mode,
                model: this.model.modelName,
            });
        }
        else {
            var dialog = new dialogs.FormViewDialog(this, {
                res_model: this.model.modelName,
                res_id: parseInt(id).toString() == id ? parseInt(id) : id,
                context: this.getSession().user_context,
                title: title,
                view_id: +this.open_popup_action,
                on_saved: function (record) {
                    self.write_completed([record.res_id], self);
                },
            }).open();
        }
    },

    _onMove: function(event) {
        var self = this;
        var item = event.data.item;
        this.active_view = this.getParent().active_view;
        this.env = this.getParent().env;
        var fields = this.active_view.fields_view.fields;
        var event_start = item.start;
        var event_end = item.end;
        var group = false;
        if (item.group != -1) {
            group = item.group;
        }
        var data = {};
        // In case of a move event, the date_delay stay the same, only date_start and stop must be updated
        data[this.date_start] = time.auto_date_to_str(event_start, fields[this.date_start].type);
        if (this.date_stop) {
            // In case of instantaneous event, item.end is not defined
            if (event_end) {
                data[this.date_stop] = time.auto_date_to_str(event_end, fields[this.date_stop].type);
            } else {
                data[this.date_stop] = data[this.date_start];
            }
        }
        if (this.date_delay && event_end) {
            var diff_seconds = Math.round((event_end.getTime() - event_start.getTime()) / 1000);
            data[this.date_delay] = diff_seconds / 3600;
        }
        if (this.env.groupBy) {
            data[this.env.groupBy[0]] = group;
        }
        self._rpc({
            model: self.model.modelName,
            method: 'write',
            args: [
                [event.data.item.id],
                data,
            ],
            context: self.getSession().user_context,
        }).then(function() {
            event.data.callback(event.data.item);
        });
    },

    _onRemove: function(event) {
        var self = this;

        function do_it(event) {
            return self._rpc({
                model: self.model.modelName,
                method: 'unlink',
                args: [
                    [event.data.item.id],
                ],
                context: self.getSession().user_context,
            }).then(function() {
                var unlink_index = false;
                for (var i=0; i<self.model.data.data.length; i++) {
                    if (self.model.data.data[i].id == event.data.item.id)
                        unlink_index = i;
                }
                if (!isNaN(unlink_index)) {
                    self.model.data.data.splice(unlink_index, 1);
                }

                event.data.callback(event.data.item);
            });
        }

        if (confirm(_t("Are you sure you want to delete this record ?"))) {
            return do_it(event);
        }
    },

    _onAdd: function(event) {
        var self = this;
        var item = event.data.item;
        this.dataset = this.getParent().dataset;
        var context = this.dataset.context;
        // Initialize default values for creation
        var default_context = {};
        default_context['default_'.concat(this.date_start)] = item.start;
        if (this.date_delay) {
            default_context['default_'.concat(this.date_delay)] = 1;
        }
        if (this.date_stop) {
            default_context['default_'.concat(this.date_stop)] = moment(item.start).add(1, 'hours').toDate();
        }
        if (item.group > 0) {
            default_context['default_'.concat(this.renderer.last_group_bys[0])] = item.group;
        }
        // Show popup
        var dialog = new dialogs.FormViewDialog(this, {
            res_model: this.model.modelName,
            res_id: null,
            context: _.extend(default_context, context),
            view_id: +this.open_popup_action,
            on_saved: function (record) {
                self.create_completed([record.res_id], self);
            },
        }).open();
        return false;
    },

    create_completed: function (id, renderer) {
        // self.dataset.ids = self.dataset.ids.concat([id]);
        self = this;
        return this._rpc({
                model: this.model.modelName,
                method: 'read',
                args: [
                    id,
                    this.model.fieldNames,
                ],
                context: this.dataset.context,
        })
        .then(function (records) {
            var new_event = self.renderer.event_data_transform(records[0]);
            var items = self.renderer.timeline.itemsData;
            items.add(new_event);
            self.renderer.timeline.setItems(items);
            self.reload();
        });
    },

    write_completed: function (id, renderer) {
        this.reload();
    },
});

return CalendarController;
});

/* Odoo web_timeline
 * Copyright 2015 ACSONE SA/NV
 * Copyright 2016 Pedro M. Baeza <pedro.baeza@tecnativa.com>
 * License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl). */

_.str.toBoolElse = function (str, elseValues, trueValues, falseValues) {
    var ret = _.str.toBool(str, trueValues, falseValues);
    if (_.isUndefined(ret)) {
        return elseValues;
    }
    return ret;
};

odoo.define('web_timeline.TimelineView', function (require) {
    "use strict";

    var core = require('web.core');
    var form_common = require('web.form_common');
    var Model = require('web.DataModel');
    var time = require('web.time');
    var View = require('web.View');
    var widgets = require('web_calendar.widgets');

    var _t = core._t;
    var _lt = core._lt;

    function isNullOrUndef(value) {
        return _.isUndefined(value) || _.isNull(value);
    }

    var TimelineView = View.extend({
        template: "TimelineView",
        display_name: _lt('Timeline'),
        icon: 'fa-clock-o',
        quick_create_instance: widgets.QuickCreate,

        init: function (parent, dataset, view_id, options) {
            this.permissions = {};
            this.grouped_by = false;
            return this._super.apply(this, arguments);
        },

        get_perm: function (name) {
            var self = this;
            var promise = self.permissions[name];
            if (self.permissions[name]) {
                return $.when(self.permissions[name]);
            } else {
                return new Model(this.dataset.model)
                    .call("check_access_rights", [name, false])
                    .then(function (value) {
                        self.permissions[name] = value;
                        return value;
                    });
            }
        },

        // set_default_options: function(options) {
        //     this._super(options);
        //     _.defaults(this.options, {
        //         confirm_on_delete: true
        //     });
        // },

        parse_colors: function () {
            if (this.fields_view.arch.attrs.colors) {
                this.colors = _(this.fields_view.arch.attrs.colors.split(';')).chain().compact().map(function (color_pair) {
                    var pair = color_pair.split(':'), color = pair[0], expr = pair[1];
                    var temp = py.parse(py.tokenize(expr));
                    return {
                        'color': color,
                        'field': temp.expressions[0].value,
                        'opt': temp.operators[0],
                        'value': temp.expressions[1].value
                    };
                }).value();
            }
        },

        start: function () {
            var self = this;
            var attrs = this.fields_view.arch.attrs;
            var fv = this.fields_view;
            this.parse_colors();
            this.$timeline = this.$el.find(".oe_timeline_widget");
            this.$(".oe_timeline_button_today").click(
                this.proxy(this.on_today_clicked));
            this.$(".oe_timeline_button_scale_day").click(
                this.proxy(this.on_scale_day_clicked));
            this.$(".oe_timeline_button_scale_week").click(
                this.proxy(this.on_scale_week_clicked));
            this.$(".oe_timeline_button_scale_month").click(
                this.proxy(this.on_scale_month_clicked));
            this.$(".oe_timeline_button_scale_year").click(
                this.proxy(this.on_scale_year_clicked));
            this.current_window = {
                start: new moment(),
                end: new moment().add(24, 'hours')
            };

            this.$el.addClass(attrs['class']);

            this.info_fields = [];
            this.mode = attrs.mode;

            if (!attrs.date_start) {
                throw new Error(_t("Timeline view has not defined 'date_start' attribute."));
            }
            this.date_start = attrs.date_start;
            this.date_stop = attrs.date_stop;
            this.date_delay = attrs.date_delay;
            this.no_period = this.date_start == this.date_stop;
            this.zoomKey = attrs.zoomKey || '';
            this.default_window = attrs.default_window || 'fit';

            if (!isNullOrUndef(attrs.quick_create_instance)) {
                self.quick_create_instance = 'instance.' + attrs.quick_create_instance;
            }

            // If this field is set ot true, we don't open the event in form
            // view, but in a popup with the view_id passed by this parameter
            if (isNullOrUndef(attrs.event_open_popup) || !_.str.toBoolElse(attrs.event_open_popup, true)) {
                this.open_popup_action = false;
            } else {
                this.open_popup_action = attrs.event_open_popup;
            }

            this.fields = fv.fields;

            for (var fld = 0; fld < fv.arch.children.length; fld++) {
                this.info_fields.push(fv.arch.children[fld].attrs.name);
            }

            var fields_get = new Model(this.dataset.model)
                .call('fields_get')
                .then(function (fields) {
                    self.fields = fields;
                });
            this._super.apply(this, self);
            return $.when(
                self.fields_get,
                self.get_perm('unlink'),
                self.get_perm('write'),
                self.get_perm('create')
            ).then(function () {
                self.init_timeline();
                $(window).trigger('resize');
                self.trigger('timeline_view_loaded', fv);
            });
        },

        init_timeline: function () {
            var self = this;
            var options = {
                groupOrder: self.group_order,
                editable: {
                    // add new items by double tapping
                    add: self.permissions['create'],
                    // drag items horizontally
                    updateTime: self.permissions['write'],
                    // drag items from one group to another
                    updateGroup: self.permissions['write'],
                    // delete an item by tapping the delete button top right
                    remove: self.permissions['unlink']
                },
                orientation: 'both',
                selectable: true,
                showCurrentTime: true,
                onAdd: self.on_add,
                onMove: self.on_move,
                onUpdate: self.on_update,
                onRemove: self.on_remove,
                zoomKey: this.zoomKey
            };
            if (this.default_window) {
                var start = new moment();
                var end;
                switch (this.default_window) {
                    case 'day':
                        end = new moment().add(1, 'days');
                        break;
                    case 'week':
                        end = new moment().add(1, 'weeks');
                        break;
                    case 'month':
                        end = new moment().add(1, 'months');
                        break;
                }
                if (end) {
                    options['start'] = start;
                    options['end'] = end;
                }else{
                   this.default_window = 'fit';
                }
            }
            self.timeline = new vis.Timeline(self.$timeline.empty().get(0));
            self.timeline.setOptions(options);
            if (self.mode && self['on_scale_' + self.mode + '_clicked']) {
                self['on_scale_' + self.mode + '_clicked']();
            }
            self.timeline.on('click', self.on_click);
        },

        group_order: function (grp1, grp2) {
            // display non grouped elements first
            if (grp1.id === -1) {
                return -1;
            }
            if (grp2.id === -1) {
                return +1;
            }
            return grp1.content - grp2.content;

        },

        /* Transform Odoo event object to timeline event object */
        event_data_transform: function (evt) {
            var self = this;
            var date_start = new moment();
            var date_stop;

            var date_delay = evt[this.date_delay] || false,
                all_day = this.all_day ? evt[this.all_day] : false,
                res_computed_text = '',
                the_title = '',
                attendees = [];

            if (!all_day) {
                date_start = time.auto_str_to_date(evt[this.date_start]);
                date_stop = this.date_stop ? time.auto_str_to_date(evt[this.date_stop]) : null;
            }
            else {
                date_start = time.auto_str_to_date(evt[this.date_start].split(' ')[0], 'start');
                if (this.no_period) {
                    date_stop = date_start
                } else {
                    date_stop = this.date_stop ? time.auto_str_to_date(evt[this.date_stop].split(' ')[0], 'stop') : null;
                }
            }
            if (!date_start) {
                date_start = new moment();
            }
            if (!date_stop && date_delay) {
                date_stop = moment(date_start).add(date_delay, 'hours').toDate();
            }

            var group = evt[self.last_group_bys[0]];
            if (group) {
                group = _.first(group);
            } else {
                group = -1;
            }
            _.each(self.colors, function (color) {
                if (eval("'" + evt[color.field] + "' " + color.opt + " '" + color.value + "'"))
                    self.color = color.color;
            });
            var r = {
                'start': date_start,
                'content': evt.__name != undefined ? evt.__name : evt.display_name,
                'id': evt.id,
                'group': group,
                'evt': evt,
                'style': 'background-color: ' + self.color + ';'
            };
            // Check if the event is instantaneous, if so, display it with a point on the timeline (no 'end')
            if (date_stop && !moment(date_start).isSame(date_stop)) {
                r.end = date_stop;
            }
            self.color = undefined;
            return r;
        },

        do_search: function (domains, contexts, group_bys) {
            var self = this;
            self.last_domains = domains;
            self.last_contexts = contexts;
            // select the group by
            var n_group_bys = [];
            if (this.fields_view.arch.attrs.default_group_by) {
                n_group_bys = this.fields_view.arch.attrs.default_group_by.split(',');
            }
            if (group_bys.length) {
                n_group_bys = group_bys;
            }
            self.last_group_bys = n_group_bys;
            // gather the fields to get
            var fields = _.compact(_.map(["date_start", "date_delay", "date_stop", "progress"], function (key) {
                return self.fields_view.arch.attrs[key] || '';
            }));

            fields = _.uniq(fields.concat(_.pluck(this.colors, "field").concat(n_group_bys)));
            return $.when(this.has_been_loaded).then(function () {
                return self.dataset.read_slice(fields, {
                    domain: domains,
                    context: contexts
                }).then(function (data) {
                    return self.on_data_loaded(data, n_group_bys);
                });
            });
        },

        reload: function () {
            var self = this;
            if (this.last_domains !== undefined) {
                self.current_window = self.timeline.getWindow();
                return this.do_search(this.last_domains, this.last_contexts, this.last_group_bys);
            }
        },

        on_data_loaded: function (events, group_bys) {
            var self = this;
            var ids = _.pluck(events, "id");
            return this.dataset.name_get(ids).then(function (names) {
                var nevents = _.map(events, function (event) {
                    return _.extend({
                        __name: _.detect(names, function (name) {
                            return name[0] == event.id;
                        })[1]
                    }, event);
                });
                return self.on_data_loaded_2(nevents, group_bys);
            });
        },

        on_data_loaded_2: function (events, group_bys) {
            var self = this;
            var data = [];
            var groups = [];
            this.grouped_by = group_bys;
            _.each(events, function (event) {
                if (event[self.date_start]) {
                    data.push(self.event_data_transform(event));
                }
            });
            // get the groups
            var split_groups = function (events, group_bys) {
                if (group_bys.length === 0)
                    return events;
                var groups = [];
                groups.push({id: -1, content: _t('-')})
                _.each(events, function (event) {
                    var group_name = event[_.first(group_bys)];
                    if (group_name) {
                        var group = _.find(groups, function (group) {
                            return _.isEqual(group.id, group_name[0]);
                        });
                        if (group === undefined) {
                            group = {id: group_name[0], content: group_name[1]};
                            groups.push(group);
                        }
                    }
                });
                return groups;
            }
            var groups = split_groups(events, group_bys);
            this.timeline.setGroups(groups);
            this.timeline.setItems(data);
            if (!this.default_window || this.default_window == 'fit'){
                this.timeline.fit();
            }
        },

        do_show: function () {
            this.do_push_state({});
            return this._super();
        },

        is_action_enabled: function (action) {
            if (action === 'create' && !this.options.creatable) {
                return false;
            }
            return this._super(action);
        },

        create_completed: function (id) {
            var self = this;
            this.dataset.ids = this.dataset.ids.concat([id]);
            this.dataset.trigger("dataset_changed", id);
            this.dataset.read_ids([id], this.fields).done(function (records) {
                var new_event = self.event_data_transform(records[0]);
                var items = self.timeline.itemsData;
                items.add(new_event);
                self.timeline.setItems(items);
            });
        },

        on_add: function (item, callback) {
            var self = this;
            var context = this.dataset.get_context();
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
                default_context['default_'.concat(this.last_group_bys[0])] = item.group;
            }
            context.add(default_context);
            // Show popup
            var dialog = new form_common.FormViewDialog(this, {
                res_model: this.dataset.model,
                res_id: null,
                context: context,
                view_id: +this.open_popup_action
            }).open();
            dialog.on('create_completed', this, this.create_completed);
            return false;
        },

        write_completed: function (id) {
            this.dataset.trigger("dataset_changed", id);
            this.current_window = this.timeline.getWindow();
            this.reload();
            this.timeline.setWindow(this.current_window);
        },

        on_update: function (item, callback) {
            var self = this;
            var id = item.evt.id;
            var title = item.evt.__name;
            if (!this.open_popup_action) {
                var index = this.dataset.get_id_index(id);
                this.dataset.index = index;
                if (this.write_right) {
                    this.do_switch_view('form', null, {mode: "edit"});
                } else {
                    this.do_switch_view('form', null, {mode: "view"});
                }
            }
            else {
                var dialog = new form_common.FormViewDialog(this, {
                    res_model: this.dataset.model,
                    res_id: parseInt(id).toString() == id ? parseInt(id) : id,
                    context: this.dataset.get_context(),
                    title: title,
                    view_id: +this.open_popup_action
                }).open();
                dialog.on('write_completed', this, this.write_completed);
            }
            return false;
        },

        on_move: function (item, callback) {
            var self = this;
            var event_start = item.start;
            var event_end = item.end;
            var group = false;
            if (item.group != -1) {
                group = item.group;
            }
            var data = {};
            // In case of a move event, the date_delay stay the same, only date_start and stop must be updated
            data[this.date_start] = time.auto_date_to_str(event_start, self.fields[this.date_start].type);
            if (this.date_stop) {
                // In case of instantaneous event, item.end is not defined
                if (event_end) {
                    data[this.date_stop] = time.auto_date_to_str(event_end, self.fields[this.date_stop].type);
                } else {
                    data[this.date_stop] = data[this.date_start]
                }
            }
            if (this.date_delay && event_end) {
                var diff_seconds = Math.round((event_end.getTime() - event_start.getTime()) / 1000);
                data[this.date_delay] = diff_seconds / 3600;
            }
            if (self.grouped_by) {
                data[self.grouped_by[0]] = group;
            }
            var id = item.evt.id;
            this.dataset.write(id, data);
        },

        on_remove: function (item, callback) {
            var self = this;

            function do_it() {
                return $.when(self.dataset.unlink([item.evt.id])).then(function () {
                    callback(item);
                });
            }

            if (this.options.confirm_on_delete) {
                if (confirm(_t("Are you sure you want to delete this record ?"))) {
                    return do_it();
                }
            } else
                return do_it();
        },

        on_click: function (e) {
            // handle a click on a group header
            if (e.what == 'group-label') {
                return this.on_group_click(e);
            }
        },

        on_group_click: function (e) {
            if (e.group == -1) {
                return;
            }
            return this.do_action({
                type: 'ir.actions.act_window',
                res_model: this.fields[this.last_group_bys[0]].relation,
                res_id: e.group,
                target: 'new',
                views: [[false, 'form']]
            });
        },

        scale_current_window: function (factor) {
            if (this.timeline) {
                this.current_window = this.timeline.getWindow();
                this.current_window.end = moment(this.current_window.start).add(factor, 'hours');
                this.timeline.setWindow(this.current_window);
            }
        },

        on_today_clicked: function () {
            this.current_window = {
                start: new moment(),
                end: new moment().add(24, 'hours')
            };

            if (this.timeline) {
                this.timeline.setWindow(this.current_window);
            }
        },

        on_scale_day_clicked: function () {
            this.scale_current_window(24);
        },

        on_scale_week_clicked: function () {
            this.scale_current_window(24 * 7);
        },

        on_scale_month_clicked: function () {
            this.scale_current_window(24 * 30);
        },

        on_scale_year_clicked: function () {
            this.scale_current_window(24 * 365);
        }
    });

    core.view_registry.add('timeline', TimelineView);
    return TimelineView;
});

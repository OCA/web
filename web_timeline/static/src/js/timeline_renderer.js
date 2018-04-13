odoo.define('web_timeline.TimelineRenderer', function (require) {
"use strict";

var AbstractRenderer = require('web.AbstractRenderer');
var core = require('web.core');
var time = require('web.time');

var _t = core._t;

var CalendarRenderer = AbstractRenderer.extend({
    template: "TimelineView",
    events: _.extend({}, AbstractRenderer.prototype.events, {
    }),

    init: function (parent, state, params) {
        this._super.apply(this, arguments);
        this.modelName = params.model;
        this.mode = params.mode;
        this.options = params.options;
        this.permissions = params.permissions;
        this.timeline = params.timeline;
        this.date_start = params.date_start;
        this.date_stop = params.date_stop;
        this.date_delay = params.date_delay;
        this.colors = params.colors;
        this.fieldNames = params.fieldNames;
        this.view = params.view;
        this.modelClass = this.view.model;
    },

    start: function () {
        var self = this;
        var attrs = this.arch.attrs;
        this.current_window = {
            start: new moment(),
            end: new moment().add(24, 'hours')
        };

        this.$el.addClass(attrs.class);
        this.$timeline = this.$el.find(".oe_timeline_widget");

        if (!this.date_start) {
            throw new Error(_t("Timeline view has not defined 'date_start' attribute."));
        }
        this._super.apply(this, self);
    },

    _render: function () {
        this.add_events();
        var self = this;
        return $.when().then(function () {
            // Prevent Double Rendering on Updates
            if (!self.timeline) {
                self.init_timeline();
                $(window).trigger('resize');
            }
        });
    },

    add_events: function() {
        var self = this;
        this.$(".oe_timeline_button_today").click(function(){
            self._onTodayClicked();});
        this.$(".oe_timeline_button_scale_day").click(function(){
            self._onScaleDayClicked();});
        this.$(".oe_timeline_button_scale_week").click(function(){
            self._onScaleWeekClicked();});
        this.$(".oe_timeline_button_scale_month").click(function(){
            self._onScaleMonthClicked();});
        this.$(".oe_timeline_button_scale_year").click(function(){
            self._onScaleYearClicked();});
    },

    _onTodayClicked: function () {
        this.current_window = {
            start: new moment(),
            end: new moment().add(24, 'hours')
        };

        if (this.timeline) {
            this.timeline.setWindow(this.current_window);
        }
    },

    _onScaleDayClicked: function () {
        this._scaleCurrentWindow(24);
    },

    _onScaleWeekClicked: function () {
        this._scaleCurrentWindow(24 * 7);
    },

    _onScaleMonthClicked: function () {
        this._scaleCurrentWindow(24 * 30);
    },

    _onScaleYearClicked: function () {
        this._scaleCurrentWindow(24 * 365);
    },

    _scaleCurrentWindow: function (factor) {
        if (this.timeline) {
            this.current_window = this.timeline.getWindow();
            this.current_window.end = moment(this.current_window.start).add(factor, 'hours');
            this.timeline.setWindow(this.current_window);
        }
    },

    _onClick: function (e) {
        // handle a click on a group header
        if (e.what === 'group-label') {
            return self._onGroupClick(e);
        }
    },

    _onGroupClick: function (e) {
        if (e.group === -1) {
            return;
        }
        return this.do_action({
            type: 'ir.actions.act_window',
            res_model: this.view.fields_view.fields[this.last_group_bys[0]].relation,
            res_id: e.group,
            target: 'new',
            views: [[false, 'form']]
        });
    },

    _computeMode: function() {
        if (this.mode) {
            var start = false, end = false;
            switch (this.mode) {
                case 'day':
                    start = new moment().startOf('day');
                    end = new moment().endOf('day');
                    break;
                case 'week':
                    start = new moment().startOf('week');
                    end = new moment().endOf('week');
                    break;
                case 'month':
                    start = new moment().startOf('month');
                    end = new moment().endOf('month');
                    break;
            }
            if (end && start) {
                this.options.start = start;
                this.options.end = end;
            } else {
               this.mode = 'fit';
            }
        }
    },

    init_timeline: function () {
        var self = this;
        this._computeMode();
        this.options.editable = {
            // add new items by double tapping
            add: this.modelClass.data.rights.create,
            // drag items horizontally
            updateTime: this.modelClass.data.rights.write,
            // drag items from one group to another
            updateGroup: this.modelClass.data.rights.write,
            // delete an item by tapping the delete button top right
            remove: this.modelClass.data.rights.unlink,
        };
        $.extend(this.options, {
            onAdd: self.on_add,
            onMove: self.on_move,
            onUpdate: self.on_update,
            onRemove: self.on_remove,
        });
        this.timeline = new vis.Timeline(self.$timeline.empty().get(0));
        this.timeline.setOptions(this.options);
        if (self.mode && self['on_scale_' + self.mode + '_clicked']) {
            self['on_scale_' + self.mode + '_clicked']();
        }
        this.timeline.on('click', self._onClick);
        var group_bys = this.arch.attrs.default_group_by.split(',');
        this.last_group_bys = group_bys;
        this.last_domains = this.modelClass.data.domain;
        this.on_data_loaded(this.modelClass.data.data, group_bys);
    },

    on_data_loaded: function (events, group_bys) {
        var self = this;
        var ids = _.pluck(events, "id");
        return this._rpc({
            model: this.modelName,
            method: 'name_get',
            args: [
                ids,
            ],
            context: this.getSession().user_context,
        }).then(function(names) {
            var nevents = _.map(events, function (event) {
                return _.extend({
                    __name: _.detect(names, function (name) {
                        return name[0] === event.id;
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
        groups = this.split_groups(events, group_bys);
        this.timeline.setGroups(groups);
        this.timeline.setItems(data);
        if (!this.mode || this.mode == 'fit'){
            this.timeline.fit();
        }
    },

    // get the groups
    split_groups: function (events, group_bys) {
        if (group_bys.length === 0) {
            return events;
        }
        var groups = [];
        groups.push({id: -1, content: _t('-')});
        _.each(events, function (event) {
            var group_name = event[_.first(group_bys)];
            if (group_name) {
                if (group_name instanceof Array) {
                    var group = _.find(groups, function (group) {
                        return _.isEqual(group.id, group_name[0]);
                    });
                    if (group == null) {
                        group = {id: group_name[0], content: group_name[1]};
                        groups.push(group);
                    }
                }
            }
        });
        return groups;
    },

    /* Transform Odoo event object to timeline event object */
    event_data_transform: function (evt) {
        var self = this;
        var date_start = new moment();
        var date_stop = null;

        var date_delay = evt[this.date_delay] || false,
            all_day = this.all_day ? evt[this.all_day] : false;

        if (all_day) {
            date_start = time.auto_str_to_date(evt[this.date_start].split(' ')[0], 'start');
            if (this.no_period) {
                date_stop = date_start;
            } else {
                date_stop = this.date_stop ? time.auto_str_to_date(evt[this.date_stop].split(' ')[0], 'stop') : null;
            }
        } else {
            date_start = time.auto_str_to_date(evt[this.date_start]);
            date_stop = this.date_stop ? time.auto_str_to_date(evt[this.date_stop]) : null;
        }
        if (date_start) {
        }
        if (!date_stop && date_delay) {
            date_stop = moment(date_start).add(date_delay, 'hours').toDate();
        }

        var group = evt[self.last_group_bys[0]];
        if (group && group instanceof Array) {
            group = _.first(group);
        } else {
            group = -1;
        }
        _.each(self.colors, function (color) {
            if (eval("'" + evt[color.field] + "' " + color.opt + " '" + color.value + "'")) {
                self.color = color.color;
            }
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
        self.color = null;
        return r;
    },

    on_update: function (item, callback) {
        this._trigger(item, callback, 'onUpdate');
    },

    on_move: function (item, callback) {
        this._trigger(item, callback, 'onMove');
    },

    on_remove: function (item, callback) {
        this._trigger(item, callback, 'onRemove');
    },

    on_add: function (item, callback) {
        this._trigger(item, callback, 'onAdd');
    },

    _trigger: function (item, callback, trigger) {
        this.trigger_up(trigger, {
            'item': item,
            'callback': callback,
            'rights': this.modelClass.data.rights,
            'renderer': this,
        });
    },

});

return CalendarRenderer;
});

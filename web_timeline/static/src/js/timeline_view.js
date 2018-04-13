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

var fieldsToGather = [
    "date_start",
    "date_stop",
    "default_group_by",
    "progress",
    "date_delay",
];

odoo.define('web_timeline.TimelineView', function (require) {
    "use strict";

    var core = require('web.core');
    var dialogs = require('web.view_dialogs');
    var Model = require('web.BasicModel');
    var time = require('web.time');
    var QuickCreate = require('web.CalendarQuickCreate');
    var view_registry = require('web.view_registry');
    var AbstractView = require('web.AbstractView');
    var TimelineRenderer = require('web_timeline.TimelineRenderer');
    var TimelineController = require('web_timeline.TimelineController');
    var TimelineModel = require('web_timeline.TimelineModel');

    var _t = core._t;
    var _lt = core._lt;

    function isNullOrUndef(value) {
        return _.isUndefined(value) || _.isNull(value);
    }

    var TimelineView = AbstractView.extend({
        display_name: _lt('Timeline'),
        icon: 'fa-clock-o',
        jsLibs: ['/web_timeline/static/lib/vis/vis-timeline-graph2d.min.js'],
        cssLibs: ['/web_timeline/static/lib/vis/vis-timeline-graph2d.min.css'],
        config: {
            Model: TimelineModel,
            Controller: TimelineController,
            Renderer: TimelineRenderer,
        },
        quick_create_instance: QuickCreate,

        init: function (viewInfo, params) {
            this._super.apply(this, arguments);
            self = this;
            this.timeline = false;
            this.arch = viewInfo.arch;
            var attrs = this.arch.attrs;
            this.fields = viewInfo.fields;
            this.modelName = this.controllerParams.modelName;

            var fieldNames = this.fields.display_name ? ['display_name'] : [];
            var mapping = {};
            fieldsToGather.push(attrs.default_group_by);

            _.each(fieldsToGather, function (field) {
                if (attrs[field]) {
                    var fieldName = attrs[field];
                    mapping[field] = fieldName;
                    fieldNames.push(fieldName);
                }
            });
            this.parse_colors();
            for (var i=0; i<this.colors.length; i++) {
                fieldNames.push(this.colors[i].field);
            }

            this.permissions = {};
            this.grouped_by = false;
            this.date_start = attrs.date_start;
            this.date_stop = attrs.date_stop;
            this.date_delay = attrs.date_delay;

            this.no_period = this.date_start == this.date_stop;
            this.zoomKey = attrs.zoomKey || '';
            this.mode = attrs.mode || attrs.default_window || 'fit';

            this.current_window = {
                start: new moment(),
                end: new moment().add(24, 'hours')
            };
            if (!isNullOrUndef(attrs.quick_create_instance)) {
                self.quick_create_instance = 'instance.' + attrs.quick_create_instance;
            }
            this.options = {
                groupOrder: this.group_order,
                orientation: 'both',
                selectable: true,
                showCurrentTime: true,
                zoomKey: this.zoomKey
            };
            if (isNullOrUndef(attrs.event_open_popup) || !_.str.toBoolElse(attrs.event_open_popup, true)) {
                this.open_popup_action = false;
            } else {
                this.open_popup_action = attrs.event_open_popup;
            }
            this.rendererParams.mode = this.mode;
            this.rendererParams.model = this.modelName;
            this.rendererParams.options = this.options;
            this.rendererParams.permissions = this.permissions;
            this.rendererParams.current_window = this.current_window;
            this.rendererParams.timeline = this.timeline;
            this.rendererParams.date_start = this.date_start;
            this.rendererParams.date_stop = this.date_stop;
            this.rendererParams.date_delay = this.date_delay;
            this.rendererParams.colors = this.colors;
            this.rendererParams.fieldNames = fieldNames;
            this.loadParams.modelName = this.modelName;
            this.loadParams.fieldNames = fieldNames;
            this.controllerParams.open_popup_action = this.open_popup_action;
            this.controllerParams.date_start = this.date_start;
            this.controllerParams.date_stop = this.date_stop;
            this.controllerParams.date_delay = this.date_delay;
            return this;
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

        parse_colors: function () {
            if (this.arch.attrs.colors) {
                this.colors = _(this.arch.attrs.colors.split(';')).chain().compact().map(function (color_pair) {
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

    });

    view_registry.add('timeline', TimelineView);
    return TimelineView;
});

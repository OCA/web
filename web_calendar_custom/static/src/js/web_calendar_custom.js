/*
    © 2018 Savoir-faire Linux <https://savoirfairelinux.com>
    License LGPL-3.0 or later (http://www.gnu.org/licenses/LGPL.html).
*/


odoo.define('web_calendar_custom.renderer_setting', function (require) {
"use strict";

    var rpc = require('web.rpc');
    var AbstractRenderer = require('web.AbstractRenderer');
    var core = require('web.core');

    var _t = core._t;


    String.prototype.toHHMMSS = function () {
        var hour_num = parseFloat(this);
        var hours   = Math.trunc(hour_num);
        var minutes = (hour_num - hours) * 60;

        if (hours   < 10) {hours   = "0"+hours;}
        if (minutes < 10) {minutes = "0"+minutes;}
        return hours+':'+minutes+':'+'00';
    }

    /* Get configuration values from res.config.settings */
    rpc.query({
             model: 'res.config.settings',
             method: 'get_values'
    }).then(function (config_values) {
        /* Override fullCalendar configuration */
        var Thread = AbstractRenderer.include({

            start: function () {
                this._super.apply(this, arguments);

                var self = this;

                this.$calendar = this.$(".o_calendar_widget");

                //Documentation here : http://arshaw.com/fullcalendar/docs/
                if(this.$calendar.fullCalendar != null){

                       var fc_options = $.extend({}, this.state.fc_options, {

                       eventDrop: function (event) {
                            self.trigger_up('dropRecord', event);
                        },
                        eventResize: function (event) {
                            self.trigger_up('updateRecord', event);
                        },
                        eventClick: function (event) {
                            self.trigger_up('openEvent', event);
                            self.$calendar.fullCalendar('unselect');
                        },
                        select: function (target_date, end_date, event, _js_event, _view) {
                            var data = {'start': target_date, 'end': end_date};
                            if (self.state.context.default_name) {
                                data.title = self.state.context.default_name;
                            }
                            self.trigger_up('openCreate', data);
                            self.$calendar.fullCalendar('unselect');
                        },
                        eventRender: function (event, element) {
                            var $render = $(self._eventRender(event));
                            event.title = $render.find('.o_field_type_char:first').text();
                            element.find('.fc-content').html($render.html());
                            element.addClass($render.attr('class'));
                            var display_hour = '';
                            if (!event.allDay) {
                                var start = event.r_start || event.start;
                                var end = event.r_end || event.end;
                                var timeFormat = _t.database.parameters.time_format.search("%H") != -1 ? 'HH:mm': 'h:mma';
                                display_hour = start.format(timeFormat) + ' - ' + end.format(timeFormat);
                                if (display_hour === '00:00 - 00:00') {
                                    display_hour = _t('All day');
                                }
                            }
                            element.find('.fc-content .fc-time').text(display_hour);
                        },
                        eventAfterAllRender: function () {
                            $(window).trigger('resize');
                        },
                        viewRender: function (view) {
                            // compute mode from view.name which is either 'month', 'agendaWeek' or 'agendaDay'
                            var mode = view.name === 'month' ? 'month' : (view.name === 'agendaWeek' ? 'week' : 'day');
                            // compute title: in week mode, display the week number
                            var title = mode === 'week' ? view.intervalStart.week() : view.title;
                            self.trigger_up('viewUpdated', {
                                mode: mode,
                                title: title,
                            });
                        },
                        height: 'parent',
                        unselectAuto: false,
                        editable: true,
                        minTime: String(config_values.calendar_start_time).toHHMMSS(),
                        maxTime: String(config_values.calendar_end_time).toHHMMSS(),
                        scrollTime: String(config_values.calendar_start_work_time).toHHMMSS(),
                        slotDuration: String(config_values.calendar_row_duration).toHHMMSS(),
                        firstDay: String(config_values.calendar_first_day_of_week),
                        weekends: config_values.is_weekend_active,
                        slotEventOverlap: config_values.is_event_overlap,
                    });

                    this.$calendar.fullCalendar('destroy');
                    this.$calendar.fullCalendar(fc_options);
                    return this._super();
                }
            },
        });
    });
});

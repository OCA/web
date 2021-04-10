odoo.define('web_view_calendar_column.CalendarRenderer', function (require) {
    "use strict";

    var CalendarRenderer = require('web.CalendarRenderer');
    var core = require('web.core');
    var qweb = core.qweb;
    var _t = core._t;
    CalendarRenderer.include({
        _initCalendar: function () {
            var self = this;

            this.$calendar = this.$(".o_calendar_widget");

            // This seems like a workaround but apparently passing the locale
            // in the options is not enough. We should initialize it beforehand
            var locale = moment.locale();
            $.fullCalendar.locale(locale);

            //Documentation here : http://arshaw.com/fullcalendar/docs/
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
                select: function (target_date, end_date, event, _js_event, resource) {
                    var data = {'start': target_date, 'end': end_date, 'resource': resource};
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
                // Dirty hack to ensure a correct first render
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
                //eventResourceEditable: true, // except for between resources
                height: 'parent',
                unselectAuto: false,
                schedulerLicenseKey: 'GPL-My-Project-Is-Open-Source',
                locale: locale, // reset locale when fullcalendar has already been instanciated before now
            });

            this.$calendar.fullCalendar(fc_options);
        },
        _renderEvents: function () {
            var self = this;
            this.$calendar.fullCalendar('removeEvents');
            if (this.state.columns)
                 _.each(Object.entries(this.state.columns), function (column) {
                    self.$calendar.fullCalendar('addResource', {
                      id: column[0],
                      title: column[1]
                    });
                });
            this.$calendar.fullCalendar(
                'addEventSource', this.state.data);
        },
    });
});

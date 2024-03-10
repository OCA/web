odoo.define('web_view_calendar_column.CalendarRenderer', function (require) {
    "use strict";

    var CalendarRenderer = require('web.CalendarRenderer');
    var config = require('web.config');
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
                    self._unselectEvent();
                    self.trigger_up('updateRecord', event);
                },
                eventClick: function (eventData, ev) {
                    self._unselectEvent();
                    self.$calendar.find(_.str.sprintf('[data-event-id=%s]', eventData.id)).addClass('o_cw_custom_highlight');
                    self._renderEventPopover(eventData, $(ev.currentTarget));
                },
                select: function (startDate, endDate, resource) {
                    self.isSwipeEnabled = false;
                    // Clicking on the view, dispose any visible popover. Otherwise create a new event.
                    if (self.$('.o_cw_popover').length) {
                        self._unselectEvent();
                    } else {
                        var data = {start: startDate, end: endDate, resource: resource};
                        if (self.state.context.default_name) {
                            data.title = self.state.context.default_name;
                        }
                        self.trigger_up('openCreate', data);
                    }
                    self.$calendar.fullCalendar('unselect');
                },
                eventRender: function (event, element, view) {
                    self.isSwipeEnabled = false;
                    var $render = $(self._eventRender(event));
                    element.find('.fc-content').html($render.html());
                    element.addClass($render.attr('class'));
                    element.attr('data-event-id', event.id);

                    // Add background if doesn't exist
                    if (!element.find('.fc-bg').length) {
                        element.find('.fc-content').after($('<div/>', {class: 'fc-bg'}));
                    }

                    // For month view: Show background for all-day/multidate events only
                    if (view.name === 'month' && event.record) {
                        var start = event.r_start || event.start;
                        var end = event.r_end || event.end;
                        // Detect if the event occurs in just one day
                        // note: add & remove 1 min to avoid issues with 00:00
                        var isSameDayEvent = start.clone().add(1, 'minute').isSame(end.clone().subtract(1, 'minute'), 'day');
                        if (!event.record.allday && isSameDayEvent) {
                            element.addClass('o_cw_nobg');
                        }
                    }

                    // On double click, edit the event
                    element.on('dblclick', function () {
                        self.trigger_up('edit_event', {id: event.id});
                    });
                },
                eventAfterAllRender: function () {
                    self.isSwipeEnabled = true;
                },
                viewRender: function (view) {
                    // compute mode from view.name which is either 'month', 'agendaWeek' or 'agendaDay'
                    var mode = view.name === 'month' ? 'month' : (view.name === 'agendaWeek' ? 'week' : 'day');
                    self.trigger_up('viewUpdated', {
                        mode: mode,
                        title: view.title,
                    });
                },
                // Add/Remove a class on hover to style multiple days events.
                // The css ":hover" selector can't be used because these events
                // are rendered using multiple elements.
                eventMouseover: function (eventData) {
                    self.$calendar.find(_.str.sprintf('[data-event-id=%s]', eventData.id)).addClass('o_cw_custom_hover');
                },
                eventMouseout: function (eventData) {
                    self.$calendar.find(_.str.sprintf('[data-event-id=%s]', eventData.id)).removeClass('o_cw_custom_hover');
                },
                eventDragStart: function (eventData) {
                    self.$calendar.find(_.str.sprintf('[data-event-id=%s]', eventData.id)).addClass('o_cw_custom_hover');
                    self._unselectEvent();
                },
                eventResizeStart: function (eventData) {
                    self.$calendar.find(_.str.sprintf('[data-event-id=%s]', eventData.id)).addClass('o_cw_custom_hover');
                    self._unselectEvent();
                },
                eventLimitClick: function () {
                    self._unselectEvent();
                    return 'popover';
                },
                windowResize: function () {
                    self._render();
                },
                views: {
                    day: {
                        columnFormat: 'LL'
                    },
                    week: {
                        columnFormat: 'ddd D'
                    },
                    month: {
                        columnFormat: config.device.isMobile ? 'ddd' : 'dddd'
                    }
                },
                //eventResourceEditable: true, // except for between resources
                height: 'parent',
                unselectAuto: false,
                isRTL: _t.database.parameters.direction === "rtl",
                locale: locale, // reset locale when fullcalendar has already been instanciated before now
                schedulerLicenseKey: 'GPL-My-Project-Is-Open-Source',
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
            this.$calendar.fullCalendar('addEventSource', this.state.data);
        },
    });
});

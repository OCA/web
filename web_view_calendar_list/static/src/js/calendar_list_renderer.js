odoo.define('web_view_calendar_list.CalendarListRenderer', function (require) {
    "use strict";

    var CalendarRenderer = require('web.CalendarRenderer');
    var core = require('web.core');
    var _t = core._t;

    var scales = {
        day: 'listDay',
        week: 'listWeek',
        month: 'listMonth',
    };

    var AppointmentRenderer= CalendarRenderer.extend({
        _initCalendar: function () {
            var self = this;

            this.$calendar = this.$(".o_calendar_widget");

            // This seems like a workaround but apparently passing the locale
            // in the options is not enough. We should initialize it beforehand
            var locale = moment.locale();
            $.fullCalendar.locale(locale);

            // Documentation here : http://arshaw.com/fullcalendar/docs/
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
                    element.find('.fc-list-item-title').html($render.html());
                    element.addClass($render.attr('class'));
                    var display_hour = '';
                    if (!event.allDay) {
                        var start = event.r_start || event.start;
                        var end = event.r_end || event.end;
                        var timeFormat = (
                            _t.database.parameters.time_format.search(
                                "%H"
                            ) != -1 ? 'HH:mm': 'h:mma'
                        );
                        display_hour = start.format(
                            timeFormat
                        ) + ' - ' + end.format(timeFormat);
                        if (display_hour === '00:00 - 00:00') {
                            display_hour = _t('All day');
                        }
                    }
                    element.find('.fc-list-item-time').text(display_hour);
                },
                // Dirty hack to ensure a correct first render
                eventAfterAllRender: function () {
                    $(window).trigger('resize');
                },
                viewRender: function (view) {
                    // Compute mode from view.name which is either 'month',
                    // 'agendaWeek' or 'agendaDay'
                    var mode = view.name === 'listMonth' ? 'month' : (view.name === 'listWeek' ? 'week' : 'day');
                    // Compute title: in week mode, display the week number
                    var title = mode === 'week' ? _t(
                        'Week '
                    ) + view.intervalStart.week() : view.title;
                    self.trigger_up('viewUpdated', {
                        mode: mode,
                        title: title,
                    });
                },
                height: 'parent',
                unselectAuto: false,
                locale: locale,
                /* Reset locale when fullcalendar has already been
                instanciated before now
                */
            });

            this.$calendar.fullCalendar(fc_options);
        },
        /*
        We need to overwrite it in order make a change on the state variable
        that is not dependant on the class, so we cannot modify it without
        overwriting all the class
        */
        _render: function () {
            var $calendar = this.$calendar;
            var $fc_view = $calendar.find('.fc-view');
            var scrollPosition = $fc_view.scrollLeft();
            var scrollTop = this.$calendar.find('.fc-scroller').scrollTop();

            $fc_view.scrollLeft(0);
            $calendar.fullCalendar('unselect');

            if (scales[this.state.scale] !== $calendar.data(
                'fullCalendar'
            ).getView().type) {
                $calendar.fullCalendar('changeView', scales[this.state.scale]);
            }

            if (this.target_date !== this.state.target_date.toString()) {
                $calendar.fullCalendar(
                    'gotoDate', moment(this.state.target_date));
                this.target_date = this.state.target_date.toString();
            }

            this.$small_calendar.datepicker(
                "setDate", this.state.highlight_date.toDate()
            ).find('.o_selected_range').removeClass('o_color o_selected_range');
            var $a = false;
            switch (this.state.scale) {
            case 'month':
                $a = this.$small_calendar.find('td a');
                break;
            case 'week':
                $a = this.$small_calendar.find(
                    'tr:has(.ui-state-active) a');
                break;
            case 'day':
                $a = this.$small_calendar.find('a.ui-state-active');
                break;
            }
            $a.addClass('o_selected_range');
            setTimeout(function () {
                $a.not('.ui-state-active').addClass('o_color');
            });

            $fc_view.scrollLeft(scrollPosition);

            var fullWidth = this.state.fullWidth;
            this.$('.o_calendar_sidebar_toggler')
                .toggleClass('fa-close', !fullWidth)
                .toggleClass('fa-chevron-left', fullWidth)
                .attr(
                    'title',
                    fullWidth ? _('Open Sidebar') : _('Close Sidebar'));
            this.$sidebar_container.toggleClass('o_sidebar_hidden', fullWidth);
            this.$sidebar.toggleClass('o_hidden', fullWidth);

            this._renderFilters();
            this.$calendar.appendTo('body');
            if (scrollTop) {
                this.$calendar.fullCalendar('reinitView');
            } else {
                this.$calendar.fullCalendar('render');
            }
            this._renderEvents();
            this.$calendar.prependTo(this.$('.o_calendar_view'));

            return $.when();
        },
    });

    return AppointmentRenderer;

});

odoo.define('web_view_calendar_list.CalendarListModel', function (require) {
    "use strict";

    var CalendarModel = require('web.CalendarModel');

    var AppointmentModel= CalendarModel.extend({
        _recordToCalendarEvent: function (evt) {
            var date_start = false;
            var date_stop = false;
            var date_delay = evt[this.mapping.date_delay] || 1.0,
                all_day = this.fields[
                    this.mapping.date_start
                ].type === 'date' || this.mapping.all_day &&
                    evt[this.mapping.all_day] || false,
                the_title = '',
                attendees = [];

            if (all_day) {
                date_start = evt[this.mapping.date_start].clone().startOf(
                    'day');
                date_stop = this.mapping.date_stop ? evt[
                    this.mapping.date_stop].clone().startOf('day') : null;
            } else {
                date_start = evt[this.mapping.date_start].clone();
                date_stop = this.mapping.date_stop ? evt[
                    this.mapping.date_stop].clone() : null;
            }

            if (!date_stop && date_delay) {
                date_stop = date_start.clone().add(date_delay, 'hours');
            }

            if (!all_day) {
                date_start.add(
                    this.getSession().getTZOffset(date_start), 'minutes');
                date_stop.add(
                    this.getSession().getTZOffset(date_stop), 'minutes');
            }

            if (this.mapping.all_day && evt[this.mapping.all_day]) {
                date_stop.add(1, 'days');
            }
            return {
                'record': evt,
                'start': date_start,
                'end': date_stop,
                'r_start': date_start,
                'r_end': date_stop,
                'title': the_title,
                'allDay': all_day,
                'id': evt.id,
                'attendees':attendees,
            };
        },
    });

    return AppointmentModel;

});

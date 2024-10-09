/** @odoo-module **/
/* Copyright 2023 Tecnativa - Stefan Ungureanu

 * License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl). */

import {CalendarModel} from "@web/views/calendar/calendar_model";
import {patch} from "@web/core/utils/patch";

patch(CalendarModel.prototype, "WebCalendarSlotDurationCalendarModel", {
    buildRawRecord(partialRecord, options = {}) {
        if (
            !partialRecord.end &&
            this.env.searchModel.context.calendar_slot_duration &&
            !partialRecord.isAllDay
        ) {
            const slot_duration = this.env.searchModel.context.calendar_slot_duration;
            const [hours, minutes, seconds] = slot_duration
                .match(/(\d+):(\d+):(\d+)/)
                .slice(1, 4);
            // Convert all to float
            // if we use a context like {'calendar_slot_duration': '01:30:00'}
            // we will have on the backend a duration of 10 hour and 30 minutes
            // instead of 1 hour and 30 minutes
            const durationFloat =
                parseFloat(hours) +
                parseFloat(minutes) / 60 +
                parseFloat(seconds) / 3600;
            partialRecord.end = partialRecord.start.plus({hours: durationFloat});
        }
        return this._super(partialRecord, options);
    },
});

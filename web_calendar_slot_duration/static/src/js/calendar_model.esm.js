/* Copyright 2023 Tecnativa - Stefan Ungureanu
 * License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl). */

import {CalendarModel} from "@web/views/calendar/calendar_model";
import {patch} from "@web/core/utils/patch";

patch(CalendarModel.prototype, {
    buildRawRecord(partialRecord, options = {}) {
        if (
            !partialRecord.end &&
            this.meta.context.calendar_slot_duration &&
            !partialRecord.isAllDay
        ) {
            const slot_duration = this.meta.context.calendar_slot_duration;
            const [hours, minutes, seconds] = slot_duration
                .match(/(\d+):(\d+):(\d+)/)
                .slice(1, 4);
            const durationFloat =
                Number(hours) + Number(minutes) / 60 + Number(seconds) / 3600;
            partialRecord.end = partialRecord.start.plus({hours: durationFloat});
        }
        return super.buildRawRecord(partialRecord, options);
    },
});

/** @odoo-module **/
/* Copyright 2024 Nomadi Plus Tecnologia LTDA - Italo LOPES

 * License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl). */

import {CalendarModel} from "@web/views/calendar/calendar_model";
import {patch} from "@web/core/utils/patch";
import rpc from "web.rpc";

patch(CalendarModel.prototype, "WebCalendarSlotDurationByUserCalendarModel", {
    setup(params, services) {
        this._super(params, services);
        const useSlotDurationByUser = rpc.query({
            model: "res.users",
            method: "read",
            args: [[this.user.userId], ["slot_duration"]],
        });
        return Promise.all([useSlotDurationByUser]).then(([useSlotDurationByUser]) => {
            this.user.slot_duration = useSlotDurationByUser[0].slot_duration;
        });
    },

    convertFloatTimeToString(floatTime) {
        // Check if the value is already a string
        if (typeof floatTime === "string") {
            return floatTime;
        }
        // Check if the value is a number
        if (typeof floatTime === "number" && !isNaN(floatTime)) {
            const hours = Math.floor(floatTime);
            const minutesFloat = (floatTime - hours) * 60;
            const minutes = Math.floor(minutesFloat);
            const seconds = Math.floor((minutesFloat - minutes) * 60);
            const pad = (num) => num.toString().padStart(2, "0");
            return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
        }
        // Return the value if it's not a number or a string
        return "01:00:00";
    },

    buildRawRecord(partialRecord, options = {}) {
        if (!partialRecord.end && !partialRecord.isAllDay && this.user.slot_duration) {
            // Get slot duration from user
            const slot_duration = this.user.slot_duration;
            const [hours, minutes, seconds] = this.convertFloatTimeToString(
                slot_duration
            )
                .match(/(\d+):(\d+):(\d+)/)
                .slice(1, 4);
            const durationFloat =
                parseFloat(hours) +
                parseFloat(minutes) / 60 +
                parseFloat(seconds) / 3600;
            console.log(durationFloat);
            partialRecord.end = partialRecord.start.plus({hours: durationFloat});
        }
        return this._super(partialRecord, options);
    },
});

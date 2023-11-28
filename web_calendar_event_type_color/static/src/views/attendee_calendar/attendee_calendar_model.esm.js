/** @odoo-module **/

import {AttendeeCalendarModel} from "@calendar/views/attendee_calendar/attendee_calendar_model";
import {patch} from "@web/core/utils/patch";

patch(AttendeeCalendarModel.prototype, "web_calendar_event_type_color", {
    /**
     * @override
     * Set color to the event type color
     */
    async updateAttendeeData(data) {
        const res = await this._super(...arguments);
        for (const event of Object.values(data.records)) {
            const eventData = event.rawRecord;
            event.colorIndex = eventData.color;
        }
        return res;
    },
});

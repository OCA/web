/** @odoo-module */

import {CalendarController} from "@web/views/calendar/calendar_controller";
import {calendarView} from "@web/views/calendar/calendar_view";
import {registry} from "@web/core/registry";
import {useRecordStream} from "../../hooks/use_record_stream.esm";

export class BusCalendarController extends CalendarController {
    setup() {
        super.setup();

        useRecordStream(this.props.resModel, {
            onReload: async () => await this.model.load(),
        });
    }
}

export const busCalendarView = {
    ...calendarView,
    Controller: BusCalendarController,
};

registry.category("views").add("bus_record_event_calendar", busCalendarView);

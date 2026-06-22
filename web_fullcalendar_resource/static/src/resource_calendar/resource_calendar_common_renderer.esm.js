import {CalendarCommonRenderer} from "@web/views/calendar/calendar_common/calendar_common_renderer";

const SCALE_TO_RESOURCE_VIEW = {
    day: "resourceTimeGridDay",
    week: "resourceTimeGridWeek",
};

/**
 * FullCalendar renderer for the day/week scales of the "resource" view.
 *
 * Extends the core common renderer by:
 *  - switching to the `resourceTimeGrid*` views (columns = resources);
 *  - providing the `resources` list;
 *  - attaching the `resourceIds` to each event.
 */
export class ResourceCalendarCommonRenderer extends CalendarCommonRenderer {
    get options() {
        return {
            ...super.options,
            initialView:
                SCALE_TO_RESOURCE_VIEW[this.props.model.scale] || "resourceTimeGridDay",
            // GPL key: free to use in an open source project (AGPL).
            schedulerLicenseKey: "GPL-My-Project-Is-Open-Source",
            resources: this.props.model.resources,
            datesAboveResources: true,
            filterResourcesWithEvents: false,
            // The core week-number column hack breaks the resource grid, so we
            // disable it.
            weekNumbers: false,
        };
    }

    convertRecordToEvent(record) {
        return {
            ...super.convertRecordToEvent(record),
            resourceIds: record.resourceIds || [],
        };
    }
}

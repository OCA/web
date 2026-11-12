import {CalendarRenderer} from "@web/views/calendar/calendar_renderer";
import {ResourceCalendarCommonRenderer} from "@web_fullcalendar_resource/resource_calendar/resource_calendar_common_renderer.esm";

/**
 * Rendering dispatcher: routes the day/week scales to the resource renderer
 * (columns per resource).
 */
export class ResourceCalendarRenderer extends CalendarRenderer {
    static components = {
        ...CalendarRenderer.components,
        day: ResourceCalendarCommonRenderer,
        week: ResourceCalendarCommonRenderer,
    };
}

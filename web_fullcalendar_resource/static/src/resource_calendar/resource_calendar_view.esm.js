import {ResourceCalendarArchParser} from "@web_fullcalendar_resource/resource_calendar/resource_calendar_arch_parser.esm";
import {ResourceCalendarModel} from "@web_fullcalendar_resource/resource_calendar/resource_calendar_model.esm";
import {ResourceCalendarRenderer} from "@web_fullcalendar_resource/resource_calendar/resource_calendar_renderer.esm";
import {calendarView} from "@web/views/calendar/calendar_view";
import {registry} from "@web/core/registry";

/**
 * "resource" view: a variant of Odoo's standard calendar view that displays
 * events in vertical columns per resource, thanks to the FullCalendar Scheduler
 * plugins (resource-timegrid / resource-daygrid).
 *
 * We reuse the core calendar view as much as possible: only the ArchParser (to
 * read the `resource_field` attribute), the Model (to load the resources) and
 * the Renderer (to enable the resourceTimeGrid views) are specialized.
 */
export const resourceCalendarView = {
    ...calendarView,
    type: "resource",
    ArchParser: ResourceCalendarArchParser,
    Model: ResourceCalendarModel,
    Renderer: ResourceCalendarRenderer,
};

registry.category("views").add("resource", resourceCalendarView);

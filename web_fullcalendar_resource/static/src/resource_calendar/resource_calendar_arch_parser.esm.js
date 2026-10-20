import {CalendarArchParser} from "@web/views/calendar/calendar_arch_parser";
import {parseXML} from "@web/core/utils/xml";

const RESOURCE_SCALES = ["day", "week"];

/**
 * Arch parser for the "resource" view.
 *
 * The root arch node is `<resource ...>` instead of `<calendar ...>`. The core
 * parser only reacts to the "calendar" tag, so we relabel the root as
 * "calendar" before delegating, then read the specific `resource_field`
 * attribute.
 */
export class ResourceCalendarArchParser extends CalendarArchParser {
    parse(arch, models, modelName) {
        const root = typeof arch === "string" ? parseXML(arch) : arch;
        const resourceField = root.getAttribute("resource_field");
        if (!resourceField) {
            throw new Error(
                `Resource view has not defined "resource_field" attribute.`
            );
        }

        // Relabel <resource> as <calendar> to reuse the standard parser.
        const calendarNode = root.ownerDocument.createElement("calendar");
        for (const {name, value} of Array.from(root.attributes)) {
            calendarNode.setAttribute(name, value);
        }
        while (root.firstChild) {
            calendarNode.appendChild(root.firstChild);
        }

        const archInfo = super.parse(calendarNode, models, modelName);

        // The resource view only handles day / week scales.
        archInfo.scales = archInfo.scales.filter((s) => RESOURCE_SCALES.includes(s));
        if (!archInfo.scales.length) {
            archInfo.scales = ["day"];
        }
        if (!archInfo.scales.includes(archInfo.scale)) {
            archInfo.scale = archInfo.scales[0];
        }

        archInfo.resourceField = resourceField;
        archInfo.fieldNames = [...new Set([...archInfo.fieldNames, resourceField])];
        return archInfo;
    }
}

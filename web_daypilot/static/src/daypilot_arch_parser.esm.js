import {_t} from "@web/core/l10n/translation";
import {getActiveActions} from "@web/views/utils";
import {omit} from "@web/core/utils/objects";
import {visitXML} from "@web/core/utils/xml";

// DayPilot Calendar `scale` enum values supported by the bundled lib.
// These control the time-cell granularity of the calendar.
const SCALES = {
    CellDuration: _t("Time Slot"),
    Minute: _t("Minute"),
    Hour: _t("Hour"),
    Day: _t("Day"),
    Week: _t("Week"),
};

// Normalize a user-provided scale value to a valid DayPilot scale enum key.
function normalizeScale(value) {
    if (!value) {
        return "CellDuration";
    }
    const found = Object.keys(SCALES).find(
        (key) => key.toLowerCase() === String(value).toLowerCase()
    );
    return found || "CellDuration";
}

function getInfoFromRootNode(rootNode) {
    const attrs = {};
    for (const {name, value} of rootNode.attributes) {
        attrs[name] = value;
    }

    const {
        create: canCreate,
        delete: canDelete,
        edit: canEdit,
    } = getActiveActions(rootNode);

    const formViewId = attrs.form_view_id ? parseInt(attrs.form_view_id, 10) : null;

    const defaultScale = normalizeScale(attrs.default_scale);
    // Only "day" is fully supported for now; week/month kept as hooks
    // for the future multi-day layout (see ROADMAP).
    const defaultRange = attrs.default_range || "day";
    const timeSlotDuration = attrs.time_slot_duration
        ? parseInt(attrs.time_slot_duration, 10)
        : 60;
    const businessHoursStart = attrs.business_hours_start
        ? parseInt(attrs.business_hours_start, 10)
        : 8;
    const businessHoursEnd = attrs.business_hours_end
        ? parseInt(attrs.business_hours_end, 10)
        : 18;
    const businessHoursOnly = attrs.business_hours_only !== "false";
    const resource = attrs.default_group_by || attrs.resource || null;
    const eventTemplate = attrs.event_template || null;
    const tooltip = attrs.tooltip || null;
    const showCurrentTime = attrs.show_current_time !== "false";

    return {
        ...omit(
            attrs,
            "form_view_id",
            "default_scale",
            "default_range",
            "time_slot_duration",
            "business_hours_start",
            "business_hours_end",
            "business_hours_only",
            "group_by",
            "resource",
            "default_group_by",
            "event_template",
            "tooltip",
            "show_current_time"
        ),
        formViewId,
        canCreate,
        canDelete,
        canEdit,
        scale: defaultScale,
        defaultRange,
        timeSlotDuration,
        businessHoursStart,
        businessHoursEnd,
        businessHoursOnly,
        scales: SCALES,
        dateStartField: attrs.date_start,
        dateStopField: attrs.date_stop,
        resource,
        eventTemplate,
        tooltip,
        showCurrentTime,
    };
}

export class DayPilotArchParser {
    parse(arch) {
        let infoFromRootNode = null;
        const fieldNames = [];

        visitXML(arch, (node) => {
            switch (node.tagName) {
                case "daypilot": {
                    infoFromRootNode = getInfoFromRootNode(node);
                    break;
                }
                case "field": {
                    fieldNames.push(node.getAttribute("name"));
                    break;
                }
            }
        });

        return {
            ...infoFromRootNode,
            fieldNames,
        };
    }
}

/** @odoo-module **/

import {TimelineArchParser} from "@web_timeline/views/timeline/timeline_arch_parser.esm";
import {exprToBoolean} from "@web/core/utils/strings";
import {patch} from "@web/core/utils/patch";
import {visitXML} from "@web/core/utils/xml";

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Round a dragged date to the nearest local midnight (tasks are planned in
 * whole days; sub-day offsets are noise that leaks into forms and reports).
 *
 * @param {Date} date candidate date from a drag/resize
 * @returns {Date}
 */
export function snapToDay(date) {
    const snapped = new Date(date.getTime());
    snapped.setHours(0, 0, 0, 0);
    if (date.getHours() >= 12) {
        snapped.setDate(snapped.getDate() + 1);
    }
    return snapped;
}

/**
 * Vis options applied when a <timeline> opts into gantt mode. Kept as an
 * exported pure function so it is unit-testable without a view.
 *
 * The initial window is deliberately NOT set here: the stock renderer
 * re-fits/re-windows after construction, so the renderer patch owns the
 * window in on_attach_callback.
 *
 * @param {Object} archInfo parsed arch info (mutated)
 * @param {Element} timelineNode the <timeline> arch node
 * @returns {Object} archInfo
 */
export function applyGanttOptions(archInfo, timelineNode) {
    if (!timelineNode.hasAttribute("stack")) {
        archInfo.options.stack = false;
    }
    if (!timelineNode.hasAttribute("margin")) {
        archInfo.options.margin = {item: 6, axis: 8};
    }
    Object.assign(archInfo.options, {
        orientation: {axis: "top", item: "top"},
        verticalScroll: true,
        dataAttributes: ["id"],
        zoomMin: 3 * DAY_MS,
        zoomMax: 2 * 365 * DAY_MS,
        snap: snapToDay,
        format: {
            minorLabels: {day: "dd D", weekday: "dd D"},
            majorLabels: {day: "MMMM YYYY", weekday: "MMMM YYYY", month: "YYYY"},
        },
    });
    return archInfo;
}

patch(TimelineArchParser.prototype, {
    parse(arch) {
        const archInfo = super.parse(...arguments);
        let timelineNode = null;
        visitXML(arch, (node) => {
            if (node.tagName === "timeline" && !timelineNode) {
                timelineNode = node;
            }
        });
        archInfo.gantt_ux = Boolean(
            timelineNode && exprToBoolean(timelineNode.getAttribute("gantt_ux") || "")
        );
        if (archInfo.gantt_ux) {
            applyGanttOptions(archInfo, timelineNode);
        }
        return archInfo;
    },
});

/** @odoo-module **/
/* Copyright 2026 ForgeFlow S.L. (https://www.forgeflow.com)
 * License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl). */

import {CalendarArchParser} from "@web/views/calendar/calendar_arch_parser";
import {patch} from "@web/core/utils/patch";

export const WORKDAYS_SCALES = ["work_week", "work_month"];
const WORK_SCALE_TO_BASE = {
    work_week: "week",
    work_month: "month",
};

patch(CalendarArchParser.prototype, "web_calendar_workdays.CalendarArchParser", {
    parse(arch, models, modelName) {
        const doc = new DOMParser().parseFromString(arch, "text/xml");
        const node = doc.querySelector("calendar");
        let archForSuper = arch;
        let requestedMode = null;
        let requestedScales = null;
        if (node) {
            if (
                node.hasAttribute("mode") &&
                WORKDAYS_SCALES.includes(node.getAttribute("mode"))
            ) {
                requestedMode = node.getAttribute("mode");
                node.setAttribute("mode", WORK_SCALE_TO_BASE[requestedMode]);
            }
            if (node.hasAttribute("scales")) {
                requestedScales = node
                    .getAttribute("scales")
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean);
            }
            if (requestedMode !== null) {
                archForSuper = new XMLSerializer().serializeToString(doc);
            }
        }
        const result = this._super(archForSuper, models, modelName);
        if (requestedScales) {
            const parentScales = new Set(result.scales);
            // Preserve the order requested in the arch, keeping only scales
            // either accepted by the parent or contributed by this module.
            result.scales = requestedScales.filter(
                (s) => parentScales.has(s) || WORKDAYS_SCALES.includes(s)
            );
        }
        if (requestedMode && result.scales.includes(requestedMode)) {
            result.scale = requestedMode;
        }
        return result;
    },
});

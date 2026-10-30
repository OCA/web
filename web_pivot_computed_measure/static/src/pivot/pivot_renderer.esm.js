/* Copyright 2022 Tecnativa - Carlos Roca
 * License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html) */

import {PivotRenderer} from "@web/views/pivot/pivot_renderer";
import {ReportViewComputedMeasures} from "../report_view_measures/report_view_measures.esm";
import {patch} from "@web/core/utils/patch";

PivotRenderer.components = {
    ...PivotRenderer.components,
    ReportViewComputedMeasures,
};

patch(PivotRenderer.prototype, {
    /**
     * Divisions by zero of computed measures can't be formatted.
     *
     * @override
     */
    getFormattedValue(cell) {
        if (
            typeof cell.value === "number" &&
            (!Number.isFinite(cell.value) || Number.isNaN(cell.value))
        ) {
            return {value: "-"};
        }
        return super.getFormattedValue(...arguments);
    },
});

/* Copyright 2024 Tecnativa - Carlos Roca
 * License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html) */

import {t, useProps} from "@odoo/owl";
import {COMPUTED_PREFIX} from "../pivot/pivot_model.esm";
import {DropdownItemCustomMeasure} from "../dropdown_item_custom_measure/dropdown_item_custom_measure.esm";
import {ReportViewMeasures} from "@web/views/view_components/report_view_measures";

/**
 * Measures dropdown of the pivot view that lists the computed measures apart
 * and allows to create new ones.
 */
export class ReportViewComputedMeasures extends ReportViewMeasures {
    static template = "web_pivot_computed_measure.ReportViewComputedMeasures";
    static components = {
        ...ReportViewMeasures.components,
        DropdownItemCustomMeasure,
    };
    props = useProps({
        measures: t.any(),
        activeMeasures: t.array().optional(),
        multiSelect: t.boolean().optional(true),
        onMeasureSelected: t.function().optional(),
        // Passed as model because this module can be extended to be used on
        // other views that use measures, like the graph view.
        model: t.object(),
    });

    isComputedMeasure(measure) {
        return measure.startsWith(COMPUTED_PREFIX);
    }

    get computedMeasures() {
        return Object.keys(this.props.measures).filter((measure) =>
            this.isComputedMeasure(measure)
        );
    }
}

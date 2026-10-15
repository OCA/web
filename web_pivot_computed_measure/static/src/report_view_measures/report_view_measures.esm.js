/* Copyright 2024 Tecnativa - Carlos Roca
 * License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html) */

import {DropdownItemCustomMeasure} from "../dropdown_item_custom_measure/dropdown_item_custom_measure.esm";
import {ReportViewMeasures} from "@web/views/view_components/report_view_measures";

ReportViewMeasures.components = {
    ...ReportViewMeasures.components,
    DropdownItemCustomMeasure,
};
ReportViewMeasures.props = {
    ...ReportViewMeasures.props,
    add_computed_measures: {type: Boolean, optional: true},
    model: {type: Object, optional: true},
};

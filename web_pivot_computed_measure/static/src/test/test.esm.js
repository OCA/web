/* Copyright 2022 Tecnativa - Carlos Roca
 * License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html) */

import {registry} from "@web/core/registry";

registry.category("web_tour.tours").add("web_pivot_computed_measure_tour", {
    steps: () => [
        {
            content: "Wait for the pivot table to be loaded",
            trigger: ".o_pivot table th:contains('Pivot Computed A')",
        },
        {
            content: "Open the measures dropdown",
            trigger: ".o_pivot_buttons button.o_report_measures",
            run: "click",
        },
        {
            content: "Open the computed measure form",
            trigger: ".o_computed_measure_toggle",
            run: "click",
        },
        {
            trigger: "select#computed_measure_field_1",
            run: "select partner_latitude",
        },
        {
            trigger: "select#computed_measure_field_2",
            run: "select partner_longitude",
        },
        {
            trigger: "select#computed_measure_operation",
            run: "select m1+m2",
        },
        {
            trigger: "input#computed_measure_name",
            run: "edit Geo Sum",
        },
        {
            trigger: "select#computed_measure_format",
            run: "select float",
        },
        {
            content: "Add the computed measure",
            trigger: "button.o_add_computed_measure",
            run: "click",
        },
        {
            content: "The computed measure is listed and enabled in the dropdown",
            trigger: ".o_computed_measure.selected:contains('Geo Sum')",
        },
        {
            content: "The measures used by the computed measure are enabled",
            trigger: "th.o_pivot_measure_row:contains('Latitude')",
        },
        {
            trigger: "th.o_pivot_measure_row:contains('Longitude')",
        },
        {
            trigger: "th.o_pivot_measure_row:contains('Geo Sum')",
        },
        {
            content: "Computed value for partner A (11.11 + 22.22)",
            trigger:
                "tr:has(th:contains('Pivot Computed A')) div.o_value:contains('33.33')",
        },
        {
            content: "Computed value for partner B (44.44 + 1.01)",
            trigger:
                "tr:has(th:contains('Pivot Computed B')) div.o_value:contains('45.45')",
        },
        {
            content: "Computed value for the total (55.55 + 23.23)",
            trigger: "div.o_value:contains('78.78')",
        },
    ],
});

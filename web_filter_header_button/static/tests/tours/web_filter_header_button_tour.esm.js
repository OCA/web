/* Copyright 2026 Tecnativa - Carlos Roca
 * License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html) */

import {registry} from "@web/core/registry";

registry.category("web_tour.tours").add("web_filter_header_button_tour", {
    steps: () => [
        {
            content: "Filter buttons are hidden by default",
            trigger: ".o_control_panel:not(:has(.o_header_button_filters))",
        },
        {
            content: "Show the filter buttons",
            trigger: ".o_control_panel button[name='header_button_filters']",
            run: "click",
        },
        {
            content: "The visibility is stored for the action",
            trigger: ".o_header_button_filters",
            run() {
                const keys = Object.keys(window.localStorage).filter((key) =>
                    key.startsWith("visibleHeaderButtons")
                );
                if (
                    keys.length !== 1 ||
                    !/^visibleHeaderButtons\d+\+\d+$/.test(keys[0])
                ) {
                    throw new Error(`Unexpected visibility keys: ${keys}`);
                }
            },
        },
        {
            content: "Only flagged filters are shown, with their icon",
            trigger:
                ".o_header_button_filter[data-name='header_companies'] i.oi-filled[data-icon='business']",
        },
        {
            content: "Not migrated Font Awesome icons aren't rendered",
            trigger:
                ".o_header_button_filter[data-name='header_legacy_icon']:not(:has(i)):contains('Header Legacy Icon')",
        },
        {
            content: "Activate the filter from its button",
            trigger: ".o_header_button_filter[data-name='header_companies']",
            run: "click",
        },
        {
            trigger: ".o_searchview_facet:contains('Header Companies')",
        },
        {
            content: "The button is shown as active",
            trigger:
                ".o_header_button_filter.btn-primary[aria-pressed='true'][data-name='header_companies']",
        },
        {
            content: "Group by from its button",
            trigger: ".o_header_button_filter[data-name='header_kind']",
            run: "click",
        },
        {
            trigger: ".o_searchview_facet:contains('Header Kind')",
        },
        {
            content: "Filter by date from its button",
            trigger: ".o_header_button_filter[data-name='header_created']",
            run: "click",
        },
        {
            trigger: ".o_searchview_facet:contains('Header Created')",
        },
        {
            trigger:
                ".o_header_button_filter[aria-pressed='true'][data-name='header_created']",
        },
        {
            content: "Remove the date filter from its button",
            trigger: ".o_header_button_filter[data-name='header_created']",
            run: "click",
        },
        {
            trigger:
                ".o_control_panel:not(:has(.o_searchview_facet:contains('Header Created')))",
        },
        {
            content: "Group by date from its button",
            trigger: ".o_header_button_filter[data-name='header_month']",
            run: "click",
        },
        {
            trigger:
                ".o_header_button_filter.btn-info[aria-pressed='true'][data-name='header_month']",
        },
        {
            content: "Remove the date grouping from its button",
            trigger: ".o_header_button_filter[data-name='header_month']",
            run: "click",
        },
        {
            trigger:
                ".o_header_button_filter[aria-pressed='false'][data-name='header_month']",
        },
        {
            content: "Clear the search",
            trigger: ".o_header_button_filters_reset",
            run: "click",
        },
        {
            trigger:
                ".o_control_panel:not(:has(.o_searchview_facet:contains('Header Companies')))",
        },
        {
            content: "Hide the filter buttons",
            trigger: ".o_control_panel button[name='header_button_filters'].active",
            run: "click",
        },
        {
            trigger: ".o_control_panel:not(:has(.o_header_button_filters))",
        },
    ],
});

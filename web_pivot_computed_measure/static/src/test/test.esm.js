/** @odoo-module **/
/* Copyright 2022 Tecnativa - Carlos Roca
 * License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html) */

import {registry} from "@web/core/registry";
import {stepUtils} from "@web_tour/tour_service/tour_utils";

registry.category("web_tour.tours").add("web_pivot_computed_measure_tour", {
    url: "/web",
    test: true,
    steps: () => [
        stepUtils.showAppsMenuItem(),
        {
            content: "go to settings",
            trigger: '.o_app[data-menu-xmlid="base.menu_administration"]',
        },
        {
            content: "go to users menu",
            trigger: 'button[data-menu-xmlid="base.menu_users"]',
        },
        {
            content: "go to users sub-menu",
            trigger: 'a[data-menu-xmlid="base.menu_action_res_users"]',
        },
        {
            content: "go to pivot view",
            trigger: "button.o_pivot",
        },
        {
            content: "open measures",
            trigger: 'button:contains(" Measures ")',
        },
        {
            content: "select computed measure",
            trigger: 'a:contains(" Computed Measure ")',
        },
        {
            content: "set field 1",
            trigger: "select#computed_measure_field_1",
            run: "text user_year_now",
        },
        {
            content: "set field 2",
            trigger: "select#computed_measure_field_2",
            run: "text user_year_born",
        },
        {
            content: "set operation",
            trigger: "select#computed_measure_operation",
            run: "text m1-m2",
        },
        {
            content: "set format",
            trigger: "select#computed_measure_format",
            run: "text integer",
        },
        {
            content: "add computed measure",
            trigger: "button.o_add_computed_measure",
        },
        {
            content: "check user year now",
            trigger: 'th.o_pivot_measure_row:contains("User Year Now")',
            extra_trigger: 'div.o_value:contains("2,022")',
        },
        {
            content: "check user year born",
            trigger: 'th.o_pivot_measure_row:contains("User Year Born")',
            extra_trigger: 'div.o_value:contains("1,998")',
        },
        {
            content: "check computed measure result",
            trigger: 'th.o_pivot_measure_row:contains("User Year Now-User Year Born")',
            extra_trigger: 'div.o_value:contains("24")',
        },
    ],
});

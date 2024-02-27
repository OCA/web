/** @odoo-module **/
/* Copyright 2022 Tecnativa - Carlos Roca
 * License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html) */

import tour from "web_tour.tour";

tour.register(
    "web_pivot_computed_measure_tour",
    {
        url: "/web",
        test: true,
    },
    [
        {
            trigger: ".o_navbar_apps_menu button",
        },
        {
            trigger: '.o_app[data-menu-xmlid="base.menu_administration"]',
        },
        {
            trigger: 'button[data-menu-xmlid="base.menu_users"]',
        },
        {
            trigger: 'a[data-menu-xmlid="base.menu_action_res_users"]',
        },
        {
            trigger: "button.o_pivot",
        },
        {
            trigger: 'button:contains(" Measures ")',
        },
        {
            trigger: 'a:contains(" Computed Measure ")',
        },
        {
            trigger: "select#computed_measure_field_1",
            run: "text user_year_now",
        },
        {
            trigger: "select#computed_measure_field_2",
            run: "text user_year_born",
        },
        {
            trigger: "select#computed_measure_operation",
            run: "text m1-m2",
        },
        {
            trigger: "select#computed_measure_format",
            run: "text integer",
        },
        {
            trigger: "button.o_add_computed_measure",
        },
        {
            trigger: 'th.o_pivot_measure_row:contains("User Year Now")',
            extra_trigger: 'div.o_value:contains("2,022")',
        },
        {
            trigger: 'th.o_pivot_measure_row:contains("User Year Born")',
            extra_trigger: 'div.o_value:contains("1,998")',
        },
        {
            trigger: 'th.o_pivot_measure_row:contains("User Year Now-User Year Born")',
            extra_trigger: 'div.o_value:contains("24")',
        },
    ]
);

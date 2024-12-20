/* Copyright 2022 Tecnativa - Carlos Roca
 * License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html) */

import {registry} from "@web/core/registry";

registry.category("web_tour.tours").add("web_pivot_computed_measure_tour", {
    url: "/odoo",
    steps: () => [
        {
            trigger: ".o_navbar_apps_menu button",
            run: "click",
        },
        {
            trigger: '.o_app[data-menu-xmlid="base.menu_administration"]',
            run: "click",
        },
        {
            trigger: 'button[data-menu-xmlid="base.menu_users"]',
            run: "click",
        },
        {
            trigger: 'a[data-menu-xmlid="base.menu_action_res_users"]',
            run: "click",
        },
        {
            trigger: "button.o_pivot",
            run: "click",
        },
        {
            trigger: '.o_pivot_buttons div[aria-label="Main actions"] button',
            run: "click",
        },
        {
            trigger: 'div[data-id="__computed__"] a',
            run: "click",
        },
        {
            trigger: "select#computed_measure_field_1",
            run() {
                this.anchor.value = "user_year_now";
            },
        },
        {
            trigger: "select#computed_measure_field_2",
            run() {
                this.anchor.value = "user_year_born";
            },
        },
        {
            trigger: "select#computed_measure_operation",
            run() {
                this.anchor.value = "m1-m2";
            },
        },
        {
            trigger: "select#computed_measure_format",
            run() {
                this.anchor.value = "integer";
            },
        },
        {
            trigger: "button.o_add_computed_measure",
            run: "click",
        },
        {
            trigger: 'th.o_pivot_measure_row:contains("User Year Now")',
        },
        {
            trigger: 'div.o_value:contains("2,022")',
        },
        {
            trigger: 'th.o_pivot_measure_row:contains("User Year Born")',
        },
        {
            trigger: 'div.o_value:contains("1,998")',
        },
        {
            trigger: 'th.o_pivot_measure_row:contains("User Year Now-User Year Born")',
        },
        {
            trigger: 'div.o_value:contains("24")',
        },
    ],
});

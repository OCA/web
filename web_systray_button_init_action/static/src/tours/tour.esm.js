/** @odoo-module **/
/* Copyright 2024 Tecnativa - Carlos Roca
 * License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html) */

import tour from "web_tour.tour";

tour.register(
    "web_systray_button_init_action_not_set_tour",
    {
        url: "/web",
        test: true,
    },
    [
        {
            trigger: ".o_navbar_apps_menu button",
            extra_trigger: ":not(:has(a[name='init_action']))",
        },
    ]
);
tour.register(
    "web_systray_button_init_action_set_tour",
    {
        url: "/web",
        test: true,
    },
    [
        {
            trigger: ".o_navbar_apps_menu button",
            extra_trigger: ".init_action_div:has(a[name='init_action'])",
        },
        {
            trigger: "a[data-menu-xmlid='base.menu_administration']",
        },
        {
            trigger: "a[name='init_action']",
        },
        {
            trigger: ".breadcrumb-item:has(span:contains('Apps'))",
        },
    ]
);

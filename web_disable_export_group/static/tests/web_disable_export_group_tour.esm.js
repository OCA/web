/** @odoo-module **/
/* Copyright 2020 Tecnativa - João Marques
   Copyright 2022 Tecnativa - Víctor Martínez
   License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl). */

import {registry} from "@web/core/registry";

registry.category("web_tour.tours").add("export_tour_xlsx_button_ok", {
    test: true,
    url: "/web#model=ir.ui.view&view_type=list&cids=&action=base.action_ui_view",

    steps: () => [
        {
            content: "Open the dropdown to find 'Export All' button",
            trigger: ".o_cp_action_menus button.dropdown-toggle",
            run: "click",
        },

        {
            content: "Check if 'Export all' button exists",
            trigger: ".dropdown-menu:has(.o_export_all_menu)",
            run: function () {
                console.log("Export All button found");
            },
        },
    ],
});

registry.category("web_tour.tours").add("export_tour_xlsx_button_ko", {
    test: true,
    url: "/web#model=ir.ui.view&view_type=list&cids=&action=base.action_ui_view",

    steps: () => [
        {
            content: "Open the dropdown to find 'Export All' button",
            trigger: ".o_cp_action_menus button.dropdown-toggle",
            run: "click",
        },
        {
            content: "Check if 'Export all' button exists",
            trigger: ".dropdown-menu:not(:has(.o_export_all_menu))",
        },
    ],
});

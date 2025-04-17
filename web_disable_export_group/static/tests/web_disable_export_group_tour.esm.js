/** @odoo-module **/
/* Copyright 2020 Tecnativa - João Marques
   Copyright 2022 Tecnativa - Víctor Martínez
   License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl). */

import {registry} from "@web/core/registry";

function openCogMenu() {
    return [
        {
            content: "Click the cog icon to open the action menu",
            trigger: ".o_cp_action_menus .o-dropdown .dropdown-toggle",
            run: "click",
        },
        {
            content: "Wait for the dropdown menu to be visible",
            trigger: ".o-dropdown--menu.dropdown-menu.show, .o-dropdown--menu.d-block",
        },
    ];
}

registry.category("web_tour.tours").add("export_tour_xlsx_button_ok", {
    test: true,
    url: "/web#model=ir.ui.view&view_type=list&action=base.action_ui_view",
    steps: () => [
        ...openCogMenu(),
        {
            content: "Check that the 'Export All' button is visible",
            trigger: ".dropdown-item.o_export_all_menu",
            run: () => {
                // Intentionally left blank
            },
        },
    ],
});

registry.category("web_tour.tours").add("export_tour_xlsx_button_ko", {
    test: true,
    url: "/web#model=ir.ui.view&view_type=list&action=base.action_ui_view",
    steps: () => [
        ...openCogMenu(),
        {
            content: "Check that the 'Export All' button is NOT visible",
            trigger: ".o_cp_action_menus:not(:has(.o_export_all_menu))",
            run: () => {
                // Intentionally left blank
            },
        },
    ],
});

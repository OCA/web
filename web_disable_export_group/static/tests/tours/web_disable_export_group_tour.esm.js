/* Copyright 2020 Tecnativa - João Marques
   Copyright 2022 Tecnativa - Víctor Martínez
   Copyright 2025 Tecnativa - Carlos Lopez
   License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl). */

import {registry} from "@web/core/registry";

registry.category("web_tour.tours").add("export_tour_xlsx_button_ok", {
    url: "/odoo/action-base.action_ui_view",
    steps: () => [
        {
            content: "Open cog menu",
            trigger: ".o_cp_action_menus button.dropdown-toggle",
            run: "click",
        },
        {
            content: "Check if 'Export all' button exists",
            trigger: ".dropdown-menu:has(.o_export_all_menu)",
        },
    ],
});
registry.category("web_tour.tours").add("export_tour_xlsx_button_ko", {
    url: "/odoo/action-base.action_ui_view",
    steps: () => [
        {
            content: "Open cog menu, if any (it is not shown when empty)",
            trigger: ".o_list_view",
            run: async () => {
                const toggle = document.querySelector(
                    ".o_cp_action_menus button.dropdown-toggle"
                );
                if (!toggle) {
                    return;
                }
                toggle.click();
                for (
                    let i = 0;
                    i < 50 && !document.querySelector(".dropdown-menu");
                    i++
                ) {
                    await new Promise((resolve) => setTimeout(resolve, 100));
                }
            },
        },
        {
            content: "Check if 'Export all' button does not exist",
            trigger: "body:not(:has(.o_export_all_menu))",
        },
    ],
});

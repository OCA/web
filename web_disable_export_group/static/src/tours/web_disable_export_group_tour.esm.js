/** @odoo-module **/
/* Copyright 2020 Tecnativa - João Marques
   Copyright 2022 Tecnativa - Víctor Martínez
   License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl). */

import tour from "web_tour.tour";

tour.register(
    "export_tour_xlsx_button_ok",
    {
        test: true,
        url: "/web#model=ir.ui.view&view_type=list&cids=&action=base.action_ui_view",
    },
    [
        {
            content: "Check if 'Export all' button exists",
            trigger: ".o_list_buttons:has(.o_list_export_xlsx)",
        },
    ]
);
tour.register(
    "export_tour_xlsx_button_ko",
    {
        test: true,
        url: "/web#model=ir.ui.view&view_type=list&cids=&action=base.action_ui_view",
    },
    [
        {
            content: "Check if 'Export all' button exists",
            trigger: ".o_list_buttons:not(:has(.o_list_export_xlsx))",
        },
    ]
);

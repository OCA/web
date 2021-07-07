/* Copyright 2020 Tecnativa - João Marques
   License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl). */

odoo.define("web_disable_export_group.tour", function (require) {
    "use strict";

    var core = require("web.core");
    var tour = require("web_tour.tour");

    var _t = core._t;

    tour.register(
        "export_tour_admin",
        {
            test: true,
            url:
                "/web#model=ir.ui.view&view_type=list&cids=&action=base.action_ui_view",
        },
        [
            {
                content: "Check if 'Export all' button exists",
                trigger: ".o_list_buttons:has(.o_list_export_xlsx)",
            },
            {
                content: "Select all records",
                trigger: ".custom-control-input:first",
            },
            {
                content: "Open actions",
                trigger: ".o_dropdown_toggler_btn",
            },
            {
                content: "Check if Export button exists",
                trigger:
                    '.o_cp_action_menus ul.o_dropdown_menu a:contains("' +
                    _t("Export") +
                    '")',
            },
        ]
    );
    tour.register(
        "export_tour_demo",
        {
            test: true,
            url:
                "/web#model=ir.ui.view&view_type=list&cids=&action=base.action_ui_view",
        },
        [
            {
                content: "Check if 'Export all' button exists",
                trigger: ".o_list_buttons:not(:has(.o_list_export_xlsx))",
            },
            {
                content: "Select all records",
                trigger: ".custom-control-input:first",
            },
            {
                content: "Open actions",
                trigger: ".o_dropdown_toggler_btn",
            },
            {
                content: "Check if Export button does not exist",
                trigger:
                    '.o_cp_action_menus ul.o_dropdown_menu a:first:not(:contains("' +
                    _t("Export") +
                    '"))',
            },
        ]
    );
    return {};
});

/* Copyright 2020 Xtendoo - Daniel Domínguez
   License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl). */

odoo.define("web_disable_archive_group.tour", function(require) {
    "use strict";

    var core = require("web.core");
    var tour = require("web_tour.tour");

    var _t = core._t;

    tour.register(
        "archive_tour_admin",
        {
            test: true,
            url:
                "/web#model=ir.ui.view&view_type=list&cids=&action=base.action_ui_view",
        },
        [
            {
                content: "Select all records",
                trigger: ".custom-control-input:first",
            },
            {
                content: "Open actions",
                trigger: ".o_dropdown_toggler_btn",
            },
            {
                content: "Check if Archive button exists",
                trigger:
                    '.o_control_panel div.o_dropdown_menu a:contains("' +
                    _t("Archive") +
                    '")',
            },
        ]
    );
    tour.register(
        "archive_tour_demo",
        {
            test: true,
            url:
                "/web#model=ir.ui.view&view_type=list&cids=&action=base.action_ui_view",
        },
        [
            {
                content: "Select all records",
                trigger: ".custom-control-input:first",
            },
            {
                content: "Open actions",
                trigger: ".o_dropdown_toggler_btn",
            },
            {
                content: "Check if Archive button does not exist",
                trigger:
                    '.o_control_panel div.o_dropdown_menu a:first:not(:contains("' +
                    _t("Archive") +
                    '"))',
            },
        ]
    );
    return {};
});

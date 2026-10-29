// (c) 2026 Hunki Enterprises BV (<https://hunki-enterprises.com>)
// License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html)

import {registry} from "@web/core/registry";

registry.category("web_tour.tours").add("web_ir_actions_act_window_page", {
    url: "/odoo/web_ir_actions_act_window_page_demo",
    steps: () => [
        {
            content: "Open admin",
            trigger: "td[data-tooltip*='Admin']",
            run: "click",
        },
        {
            content: "Click 'Previous Partner'",
            trigger: "button.oe_stat_button:contains('Previous Partner')",
            run: "click",
        },
        {
            content: "Verify demo partner is opened",
            trigger: ".o_last_breadcrumb_item.active:contains('Demo')",
        },
        {
            content: "Click 'Next Partner'",
            trigger: "button.oe_stat_button:contains('Next Partner')",
            run: "click",
        },
        {
            content: "Verify admin partner is opened",
            trigger: ".o_last_breadcrumb_item.active:contains('Admin')",
        },
        {
            content: "Click 'Switch to list view'",
            trigger: "button.oe_stat_button:contains('Switch to list view')",
            run: "click",
        },
        {
            content: "Verify admin is shown in list view",
            trigger: "td[data-tooltip*='Admin']",
        },
        {
            content: "Verify demo is shown in list view",
            trigger: "td[data-tooltip*='Demo']",
        },
    ],
});

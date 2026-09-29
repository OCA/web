import {registry} from "@web/core/registry";

registry.category("web_tour.tours").add("web_ir_actions_act_multi", {
    url: "/odoo/web_ir_actions_act_multi_demo",
    steps: () => [
        {
            content: "Open the admin partner",
            trigger: ".o_data_cell[name='complete_name']",
            run: "click",
        },
        {
            content: "Click 'Run multiple actions'",
            trigger: "button.oe_stat_button:contains('Run multiple actions')",
            run: "click",
        },
        {
            content: "Verify the first action was executed",
            trigger: ".o_notification:contains('First action executed')",
        },
        {
            content: "Verify the second action was executed",
            trigger:
                ".o_last_breadcrumb_item.active:contains('Second action executed')",
        },
        {
            content: "Verify the second action shows the partner",
            trigger: ".o_list_view .o_data_cell[name='complete_name']",
        },
    ],
});

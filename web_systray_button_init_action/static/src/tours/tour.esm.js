/* Copyright 2024 Tecnativa - Carlos Roca
 * License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html) */

import {registry} from "@web/core/registry";
import {stepUtils} from "@web_tour/tour_service/tour_utils";

registry.category("web_tour.tours").add("web_systray_button_init_action_not_set_tour", {
    url: "/web",
    test: true,
    steps: () => [
        {
            trigger: ":not(:has(button[name='init_action']))",
        },
    ],
});
registry.category("web_tour.tours").add("web_systray_button_init_action_set_tour", {
    url: "/web",
    test: true,
    steps: () => [
        {
            trigger: ".init_action_div:has(button[name='init_action'])",
        },
        stepUtils.showAppsMenuItem(),
        {
            trigger: ".o_app[data-menu-xmlid='base.menu_administration']",
            run: "click",
        },
        {
            trigger: "button[name='init_action']",
            run: "click",
        },
        {
            trigger: ".o_last_breadcrumb_item:has(span:contains('Apps'))",
        },
    ],
});

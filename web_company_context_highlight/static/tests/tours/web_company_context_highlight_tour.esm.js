/**
 * Copyright 2026 Acsone
 * @author Pierre Verkest <pierre.verkest@apycod.fr>
 * License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl). */

import {registry} from "@web/core/registry";

registry.category("web_tour.tours").add("web_company_context_highlight_tour", {
    steps: () => [
        // 1. Check absence of desktop building icon on the initial page load, and click switcher button
        {
            trigger:
                ".o_switch_company_menu:not(.o_company_context_highlighted) button",
            run: function (actions) {
                const buildingIcon = document.querySelector(
                    ".o_switch_company_menu .fa-building-o.d-lg-inline-block"
                );
                if (buildingIcon) {
                    throw new Error(
                        "fa-building desktop icon should not be present when only one company is active."
                    );
                }
                actions.click();
            },
        },
        // 2. Select Company B checkbox to enable multi-company context
        {
            trigger:
                ".o_switch_company_item:contains('Company B') div[role='menuitemcheckbox']",
            run: "click",
        },
        // 3. Click the confirm button to apply the change (causes reload)
        {
            trigger:
                ".o_switch_company_menu_buttons button.btn-primary:contains('Confirm')",
            run: "click",
            expectUnloadPage: true,
        },
        // 4. After reload, wait for the switcher to be highlighted, then check that the desktop building icon is present, and click to open the dropdown
        {
            trigger: ".o_switch_company_menu.o_company_context_highlighted button",
            run: function (actions) {
                const buildingIcon = document.querySelector(
                    ".o_switch_company_menu .fa-building-o.d-lg-inline-block"
                );
                if (!buildingIcon) {
                    throw new Error(
                        "fa-building desktop icon should be present when multiple companies are active."
                    );
                }
                actions.click();
            },
        },
        // 5. Deselect Company B
        {
            trigger:
                ".o_switch_company_item:contains('Company B') div[role='menuitemcheckbox']",
            run: "click",
        },
        // 6. Click the confirm button again (causes reload)
        {
            trigger:
                ".o_switch_company_menu_buttons button.btn-primary:contains('Confirm')",
            run: "click",
            expectUnloadPage: true,
        },
        // 7. Verify we are back to single company, NOT highlighted, and desktop building icon is gone
        {
            trigger:
                ".o_switch_company_menu:not(.o_company_context_highlighted) button",
            run: function () {
                const buildingIcon = document.querySelector(
                    ".o_switch_company_menu .fa-building-o.d-lg-inline-block"
                );
                if (buildingIcon) {
                    throw new Error(
                        "fa-building desktop icon should not be present when returning to single company."
                    );
                }
            },
        },
    ],
});

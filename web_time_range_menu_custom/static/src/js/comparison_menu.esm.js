/** @odoo-module **/
/* Copyright 2024 Tecnativa - Carlos Roca
 * License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html) */
import {ComparisonMenu} from "@web/search/comparison_menu/comparison_menu";
import {DropdownItemCustomPeriod} from "./date_selector.esm";
import {patch} from "@web/core/utils/patch";

patch(ComparisonMenu, "web_time_range_menu_custom.FilterMenu", {
    components: {
        ...ComparisonMenu.components,
        DropdownItemCustomPeriod,
    },
});

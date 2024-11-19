/** @odoo-module **/
/* Copyright 2024 Tecnativa - Carlos Roca
 * License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html) */
import {FilterMenu} from "@web/search/filter_menu/filter_menu";
import {DropdownItemCustomPeriod} from "./date_selector.esm";
import {patch} from "@web/core/utils/patch";

patch(FilterMenu, "web_time_range_menu_custom.FilterMenu", {
    components: {
        ...FilterMenu.components,
        DropdownItemCustomPeriod,
    },
});

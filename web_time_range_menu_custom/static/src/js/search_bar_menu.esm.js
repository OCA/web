/** @odoo-module **/
/* Copyright 2022 Tecnativa - Carlos Roca
 * License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html) */
import {patch} from "@web/core/utils/patch";
import {SearchBarMenu} from "@web/search/search_bar_menu/search_bar_menu";
import {DropdownItemCustomPeriod} from "./date_selector.esm";

patch(SearchBarMenu, {
    components: {
        ...SearchBarMenu.components,
        DropdownItemCustomPeriod,
    },
});

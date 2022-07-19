/** @odoo-module **/

import {patch} from "@web/core/utils/patch";
import {FilterMenu} from "@web/search/filter_menu/filter_menu";
import AdvancedFilterItem from "./AdvancedFilterItem.esm";

/**
 * Patches the FilterMenu for owl widgets.
 *
 * Pivot and Graph views use this new owl widget, so we need to patch it.
 * Other views like Tree use the old legacy widget that will probably dissapear
 * in 16.0. Until then, we need to patch both.
 */
patch(FilterMenu, "web_advanced_search.FilterMenu", {
    components: {
        ...FilterMenu.components,
        AdvancedFilterItem,
    },
});

export default FilterMenu;

/** @odoo-module **/

import {patch} from "@web/core/utils/patch";
import FilterMenu from "web.FilterMenu";
import AdvancedFilterItem from "../AdvancedFilterItem.esm";


patch(FilterMenu, "web_advanced_search.legacy.FilterMenu", {
    components: {
        ...FilterMenu.components,
        AdvancedFilterItem,
    },
});

export default FilterMenu;

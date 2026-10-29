import AdvancedFilterItem from "./advanced_filter_item.esm";
import {SearchBarMenu} from "@web/search/search_bar_menu/search_bar_menu";
import {patch} from "@web/core/utils/patch";
/**
 * Patches the SearchBarMenu to register the AdvancedFilterItem component.
 */
patch(SearchBarMenu, {
    components: {
        ...SearchBarMenu.components,
        AdvancedFilterItem,
    },
});

export default SearchBarMenu;

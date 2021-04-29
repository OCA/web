odoo.define("web_advanced_search.FilterMenu", function (require) {
    "use strict";

    const FilterMenu = require("web.FilterMenu");
    const patchMixin = require("web.patchMixin");
    const PatchableFilterMenu = patchMixin(FilterMenu);
    const AdvancedFilterItem = require("web_advanced_search.AdvancedFilterItem");

    PatchableFilterMenu.patch("web_advanced_search.FilterMenu", (T) => {
        class AdvancedFilterMenu extends T {}

        AdvancedFilterMenu.components = Object.assign({}, FilterMenu.components, {
            AdvancedFilterItem,
        });
        return AdvancedFilterMenu;
    });
    FilterMenu.components = PatchableFilterMenu.components;
});

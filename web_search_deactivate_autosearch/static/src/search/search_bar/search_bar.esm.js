import {SearchBar} from "@web/search/search_bar/search_bar";
import {browser} from "@web/core/browser/browser";
import {patch} from "@web/core/utils/patch";
import {useBus} from "@web/core/utils/hooks";

patch(SearchBar.prototype, {
    setup() {
        super.setup(...arguments);
        this.autosearch =
            browser.localStorage.getItem(
                `odoo.deactivateAutoSearch.${this.env.searchModel.resModel}`
            ) !== "true";
        useBus(this.env.searchModel, "force-search-bar-update", this.render);
    },

    toggleAutoSearch() {
        const deactivate =
            browser.localStorage.getItem(
                `odoo.deactivateAutoSearch.${this.env.searchModel.resModel}`
            ) !== "true";
        browser.localStorage.setItem(
            `odoo.deactivateAutoSearch.${this.env.searchModel.resModel}`,
            deactivate
        );
        this.autosearch = !deactivate;
        this.env.searchModel._notify();
    },

    onClickSearchIcon() {
        const deactivateAutoSearch =
            browser.localStorage.getItem(
                `odoo.deactivateAutoSearch.${this.env.searchModel.resModel}`
            ) === "true";
        if (deactivateAutoSearch) {
            this.env.searchModel.trigger_search();
        } else {
            super.onClickSearchIcon(...arguments);
        }
    },
});

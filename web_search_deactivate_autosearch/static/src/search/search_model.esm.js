import {SearchModel} from "@web/search/search_model";
import {browser} from "@web/core/browser/browser";
import {patch} from "@web/core/utils/patch";

patch(SearchModel.prototype, {
    async _notify() {
        const deactivateAutoSearch =
            browser.localStorage.getItem(
                `odoo.deactivateAutoSearch.${this.resModel}`
            ) === "true";
        if (deactivateAutoSearch) {
            if (this.blockNotification) {
                return;
            }
            this._reset();
            await this._reloadSections();
            this.trigger("force-search-bar-update");
            return;
        }
        return super._notify(...arguments);
    },

    async trigger_search() {
        if (this.blockNotification) {
            return;
        }
        this._reset();
        await this._reloadSections();
        this.trigger("update");
    },
});

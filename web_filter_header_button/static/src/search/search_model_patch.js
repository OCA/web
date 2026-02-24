/** @odoo-module **/

import {makeContext} from "@web/core/context";
import {patch} from "@web/core/utils/patch";
import {SearchModel} from "@web/search/search_model";
import {useEffect} from "@odoo/owl";

patch(SearchModel.prototype, "web_filter_header_button.search_model", {
    setup() {
        this._super(...arguments);
        // Filter flagged filters to be shown in the control panel.
        useEffect(
            () => {
                this.headerButtonFilters = this.getHeaderButtonFilters();
            },
            () => [this.searchItems]
        );
    },
    async load() {
        await this._super(...arguments);
        this.headerButtonFilters = this.getHeaderButtonFilters();
    },
    /**
     * Filter flagged filters to be shown in the control panel.
     *
     * @returns {Array}
     */
    getHeaderButtonFilters() {
        // Odoo 16 SearchModel.getSearchItems can be called with a predicate.
        // This avoids relying on the internal shape of the returned collection.
        const items = this.getSearchItems((it) => {
            if (!it || it.type === "field") {
                return false;
            }
            const ctx = makeContext([it.context || {}]);
            return Boolean(ctx.shown_in_panel);
        });
        return (items || []).map((it) => {
            return {...it, context: makeContext([it.context || {}])};
        });
    },
    /**
     * Clear the `show_in_panel` context to prevent it being saved with this context
     * @override
     * @returns {Object}
     */
    _getIrFilterDescription() {
        const {preFavorite, irFilter} = this._super(...arguments);
        if (preFavorite?.context) {
            delete preFavorite.context.shown_in_panel;
        }
        return {preFavorite, irFilter};
    },
    /**
     * Update the header filters buttons state
     * @override
     */
    async _reloadSections() {
        await this._super(...arguments);
        this.headerButtonFilters = this.getHeaderButtonFilters();
    },
});

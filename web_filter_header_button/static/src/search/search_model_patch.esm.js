import {makeContext} from "@web/core/context";
import {patch} from "@web/core/utils/patch";
import {SearchModel} from "@web/search/search_model";
import {useEffect} from "@odoo/owl";

patch(SearchModel.prototype, {
    setup() {
        super.setup(...arguments);
        // Filter flagged filters to be shown in the control panel.
        useEffect(
            () => {
                this.headerButtonFilters = this.getHeaderButtonFilters();
            },
            () => [this.searchItems]
        );
    },
    async load() {
        await super.load(...arguments);
        this.headerButtonFilters = this.getHeaderButtonFilters();
    },
    /**
     * Filter flagged filters to be shown in the control panel.
     *
     * @returns {Array}
     */
    getHeaderButtonFilters() {
        return Object.values(this.getSearchItems())
            .filter((f) => {
                // Field-type filters are used to filter based on a search, so it
                // doesn't make sense for them to be set as clickable buttons
                // at the header level.
                return (
                    f.type !== "field" &&
                    f.context &&
                    makeContext([f.context]).shown_in_panel
                );
            })
            .map((f) => {
                return {...f, context: makeContext([f.context])};
            });
    },
    /**
     * Clear the `show_in_panel` context to prevent it being saved with this context
     * @override
     * @returns {Object}
     */
    _getIrFilterDescription() {
        const {preFavorite, irFilter} = super._getIrFilterDescription(...arguments);
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
        await super._reloadSections();
        this.headerButtonFilters = this.getHeaderButtonFilters();
    },
});

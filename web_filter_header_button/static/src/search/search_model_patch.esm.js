import {SearchModel} from "@web/search/search_model";
import {makeContext} from "@web/core/context";
import {patch} from "@web/core/utils/patch";

patch(SearchModel.prototype, {
    /**
     * Search items flagged to be shown as buttons in the control panel. As
     * `searchItems` and `query` are reactive, the components reading this
     * getter are rendered again when the filters change.
     *
     * @returns {Array}
     */
    get headerButtonFilters() {
        return this.getHeaderButtonFilters();
    },
    /**
     * @returns {Array}
     */
    getHeaderButtonFilters() {
        return (
            this.getSearchItems(
                // Field-type filters are used to filter based on a search, so it
                // doesn't make sense for them to be set as clickable buttons at
                // the header level.
                (f) =>
                    f.type !== "field" &&
                    f.context &&
                    makeContext([f.context]).shown_in_panel
            )
                // Favorites contexts are already objects
                .map((f) => ({
                    ...f,
                    context: makeContext([f.context]),
                    isActive: this._isHeaderButtonFilterActive(f),
                }))
        );
    },
    /**
     * Activate or deactivate a search item from its header button. Date
     * filters and date groupings aren't handled by `toggleSearchItem`, so they
     * are activated with their default options as the search menu does.
     *
     * @param {Number} searchItemId
     */
    toggleHeaderButtonFilter(searchItemId) {
        const searchItem = this.searchItems[searchItemId];
        if (!["dateFilter", "dateGroupBy"].includes(searchItem.type)) {
            return this.toggleSearchItem(searchItemId);
        }
        if (this._isHeaderButtonFilterActive(searchItem)) {
            // Remove every selected option, not only the default ones
            const ids = [searchItemId, searchItem.relativeFilterId];
            this._filterQuery((queryElem) => !ids.includes(queryElem.searchItemId));
            this._notify();
        } else if (searchItem.type === "dateGroupBy") {
            this.toggleDateGroupBy(searchItemId);
        } else if (searchItem.defaultRelativeOptionId) {
            this.toggleRelativeFilter(
                searchItem.relativeFilterId,
                searchItem.defaultRelativeOptionId
            );
        } else {
            this.toggleParentFilter(searchItemId);
        }
    },
    /**
     * A date filter is also active when one of its relative options is set
     *
     * @param {Object} searchItem
     * @returns {Boolean}
     */
    _isHeaderButtonFilterActive(searchItem) {
        return this.query.some((queryElem) =>
            [searchItem.id, searchItem.relativeFilterId].includes(
                queryElem.searchItemId
            )
        );
    },
    /**
     * Clear the `shown_in_panel` context key to prevent it being saved with the
     * new favorite.
     *
     * @override
     */
    _getIrFilterDescription() {
        const res = super._getIrFilterDescription(...arguments);
        delete res.preFavorite?.context?.shown_in_panel;
        delete res.irFilter?.context?.shown_in_panel;
        return res;
    },
});

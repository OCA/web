/** @odoo-module **/

import {SearchModel} from "@web/search/search_model";
import {patch} from "@web/core/utils/patch";

patch(SearchModel.prototype, "web_edit_user_filter.SearchModel", {
    _getIrFilterDescription(params) {
        var {preFavorite, irFilter} = this._super(...arguments);
        if (params !== undefined && "facet" in params) {
            preFavorite.facet = params.facet;
            irFilter.facet = params.facet;
        }
        return {preFavorite, irFilter};
    },

    /**
     * Returns a filter of type 'favorite' starting from an ir_filter comming from db.
     * @private
     * @param {Object} irFilter
     * @returns {Object}
     */
    _irFilterToFavorite(irFilter) {
        var favorite = this._super(...arguments);
        if (irFilter.facet) {
            favorite.facet = irFilter.facet;
        }
        return favorite;
    },

    toggleSearchItem(searchItemId) {
        const searchItem = this.searchItems[searchItemId];
        switch (searchItem.type) {
            case "dateFilter":
            case "dateGroupBy": {
                return;
            }
        }
        const index = this.query.findIndex(
            (queryElem) => queryElem.searchItemId === searchItemId
        );
        if (index >= 0) {
            this.query.splice(index, 1);
        } else {
            if (searchItem.type === "favorite") {
                this.query = [];
            } else if (searchItem.type === "comparison") {
                // Make sure only one comparison can be active
                this.query = this.query.filter((queryElem) => {
                    const {type} = this.searchItems[queryElem.searchItemId];
                    return type !== "comparison";
                });
            }
            this.query.push({searchItemId});
        }
        this._notify();
    },
});

export default SearchModel;

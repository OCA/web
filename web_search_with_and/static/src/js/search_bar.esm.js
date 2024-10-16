/** @odoo-module **/

import {patch} from "@web/core/utils/patch";
import {SearchBar} from "@web/search/search_bar/search_bar";

patch(SearchBar.prototype, {
    selectItem(item) {
        if (!item.unselectable) {
            const {searchItemId, label, operator, value} = item;
            this.env.searchModel.addAutoCompletionValues(searchItemId, {
                label,
                operator,
                value,
                isShiftKey: this.isShiftKey,
            });
        }
        this.resetState();
    },
    onSearchKeydown(ev) {
        this.isShiftKey = ev.shiftKey || false;
        super.onSearchKeydown(ev);
    },
});

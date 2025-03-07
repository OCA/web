import {patch} from "@web/core/utils/patch";
import {SearchBar} from "@web/search/search_bar/search_bar";

patch(SearchBar.prototype, {
    selectItem(item) {
        const searchItem = this.getSearchItem(item.searchItemId);
        if (
            (searchItem.type === "field" && searchItem.fieldType === "properties") ||
            (searchItem.type === "field_property" && item.unselectable)
        ) {
            this.toggleItem(item, !item.isExpanded);
            return;
        }

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

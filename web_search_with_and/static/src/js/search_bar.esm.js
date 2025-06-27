import {patch} from "@web/core/utils/patch";
import {SearchBar} from "@web/search/search_bar/search_bar";

patch(SearchBar.prototype, {
    selectItem(item) {
        if (item.isAddCustomFilterButton) {
            return this.env.searchModel.spawnCustomFilterDialog();
        }

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
            const autoCompleteValues = {
                label,
                operator,
                value,
                isShiftKey: this.isShiftKey,
            };
            if (value && value[0] === '"' && value[value.length - 1] === '"') {
                autoCompleteValues.value = value.slice(1, -1);
                autoCompleteValues.label = label.slice(1, -1);
                autoCompleteValues.operator = "=";
                autoCompleteValues.enforceEqual = true;
            }
            this.env.searchModel.addAutoCompletionValues(
                searchItemId,
                autoCompleteValues
            );
        }

        if (item.loadMore) {
            item.loadMore();
        } else {
            this.resetState();
        }
    },

    onSearchKeydown(ev) {
        this.isShiftKey = ev.shiftKey || false;
        super.onSearchKeydown(ev);
    },
});

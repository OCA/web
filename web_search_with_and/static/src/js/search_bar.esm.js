import {SearchBar} from "@web/search/search_bar/search_bar";
import {patch} from "@web/core/utils/patch";

patch(SearchBar.prototype, {
    selectItem(item) {
        if (item.isAddCustomFilterButton) {
            return this.env.searchModel.spawnCustomFilterDialog();
        }

        const searchItem = this.getSearchItem(item.searchItemId);
        if (
            (searchItem.fieldType === "selection" && !item.isChild) ||
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

        if (item.loadMore) {
            item.loadMore();
        } else {
            this.inputDropdownState.close();
            this.resetState();
        }
    },

    _onKeyDown(ev) {
        this.isShiftKey = ev.shiftKey || false;
        if (ev.code === "Enter") {
            ev.preventDefault();
            const dropdownEl = document.querySelector(
                ".o_searchview_autocomplete.o-dropdown--menu"
            );
            const highlightedElement = dropdownEl.querySelector(
                ".o-dropdown-item.focus"
            );

            if (highlightedElement) {
                highlightedElement.click();
            } else {
                this.env.searchModel.search();
            }
        }
    },
});

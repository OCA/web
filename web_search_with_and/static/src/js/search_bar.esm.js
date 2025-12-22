import {onMounted, onWillUnmount} from "@odoo/owl";
import {SearchBar} from "@web/search/search_bar/search_bar";
import {patch} from "@web/core/utils/patch";

const searchBarSetup = SearchBar.prototype.setup;
const searchBarGetDropdownNavigation = SearchBar.prototype.getDropdownNavigation;

patch(SearchBar.prototype, {
    setup(...args) {
        searchBarSetup.call(this, ...args);
        this._searchWithAndShiftPressed = false;
        this._searchWithAndHandleKeydown = (ev) => {
            this._searchWithAndShiftPressed = Boolean(ev.shiftKey);
        };
        this._searchWithAndHandleKeyup = (ev) => {
            this._searchWithAndShiftPressed = Boolean(ev.shiftKey);
        };
        onMounted(() => {
            document.addEventListener(
                "keydown",
                this._searchWithAndHandleKeydown,
                true
            );
            document.addEventListener("keyup", this._searchWithAndHandleKeyup, true);
        });
        onWillUnmount(() => {
            document.removeEventListener(
                "keydown",
                this._searchWithAndHandleKeydown,
                true
            );
            document.removeEventListener("keyup", this._searchWithAndHandleKeyup, true);
        });
    },

    getDropdownNavigation() {
        const originalNav = searchBarGetDropdownNavigation.call(this);
        originalNav.hotkeys["shift+enter"] = {
            bypassEditableProtection: true,
            isAvailable: ({navigator}) => Boolean(navigator.activeItem),
            callback: (navigator) => {
                const activeItemIndex = navigator.activeItemIndex;
                const item = this.items[activeItemIndex];
                if (item) {
                    this._searchWithAndShiftPressed = true;
                    this.selectItem(item);
                }
            },
        };
        return originalNav;
    },

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
            const isShiftPressed =
                (window.event && window.event.shiftKey) ||
                this._searchWithAndShiftPressed;
            const autoCompletionValues = {
                label,
                operator,
                value,
                isShiftKey: isShiftPressed,
            };
            if (value && value[0] === '"' && value[value.length - 1] === '"') {
                autoCompletionValues.value = value.slice(1, -1);
                autoCompletionValues.label = label.slice(1, -1);
                autoCompletionValues.operator = "=";
                autoCompletionValues.enforceEqual = true;
            }
            this.env.searchModel.addAutoCompletionValues(
                searchItemId,
                autoCompletionValues
            );
        }

        if (item.loadMore) {
            item.loadMore();
        } else {
            this.inputDropdownState.close();
            this.resetState();
        }
    },
});

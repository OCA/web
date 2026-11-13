import {onMounted, onWillUnmount} from "@odoo/owl";
import {serializeDate, serializeDateTime} from "@web/core/l10n/dates";
import {SearchBar} from "@web/search/search_bar/search_bar";
import {patch} from "@web/core/utils/patch";
import {registry} from "@web/core/registry";

const parsers = registry.category("parsers");

// Same as the parseValue of web/static/src/search/search_bar/search_bar.js, not exported
const parseValue = (value, fieldType) => {
    const parser = parsers.contains(fieldType) ? parsers.get(fieldType) : (str) => str;
    switch (fieldType) {
        case "date": {
            return serializeDate(parser(value));
        }
        case "datetime": {
            return serializeDateTime(parser(value));
        }
        case "many2one": {
            return value;
        }
        default: {
            return parser(value);
        }
    }
};

patch(SearchBar.prototype, {
    setup() {
        super.setup(...arguments);
        this._searchWithAndShiftPressed = false;
        this._searchWithAndHandleKey = (ev) => {
            this._searchWithAndShiftPressed = Boolean(ev.shiftKey);
        };
        onMounted(() => {
            document.addEventListener("keydown", this._searchWithAndHandleKey, true);
            document.addEventListener("keyup", this._searchWithAndHandleKey, true);
        });
        onWillUnmount(() => {
            document.removeEventListener("keydown", this._searchWithAndHandleKey, true);
            document.removeEventListener("keyup", this._searchWithAndHandleKey, true);
        });
    },

    getDropdownNavigation() {
        const navigation = super.getDropdownNavigation(...arguments);
        navigation.hotkeys["shift+enter"] = {
            bypassEditableProtection: true,
            isAvailable: ({navigator}) => Boolean(navigator.activeItem),
            callback: (navigator) => {
                const item = this.items[navigator.activeItemIndex];
                if (item) {
                    this._searchWithAndShiftPressed = true;
                    this.selectItem(item);
                }
            },
        };
        return navigation;
    },

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
            const {searchItemId, fieldType} = item;
            let {label, value, operator} = item;
            if (
                !["selection", "boolean", "tags"].includes(fieldType) &&
                this.state.query !== label &&
                !item.isChild
            ) {
                label = this.state.query;
                value = parseValue(this.state.query.trim(), fieldType);
            }
            const isShiftKey = Boolean(
                (window.event && window.event.shiftKey) ||
                this._searchWithAndShiftPressed
            );
            // A value between double quotes searches for that exact value
            if (
                typeof value === "string" &&
                value.length > 1 &&
                value.startsWith('"') &&
                value.endsWith('"')
            ) {
                value = value.slice(1, -1);
                label = label.trim().slice(1, -1);
                operator = "=";
            }
            this.env.searchModel.addAutoCompletionValues(searchItemId, {
                label,
                operator,
                value,
                isShiftKey,
            });
        }

        if (item.loadMore) {
            item.loadMore();
        } else {
            this.inputDropdownState.close();
            this.resetState();
        }
    },
});

import {ControlPanel} from "@web/search/control_panel/control_panel";
import {FilterButton} from "../filter_button/filter_button.esm";
import {Transition} from "@web/core/transition";
import {browser} from "@web/core/browser/browser";
import {patch} from "@web/core/utils/patch";
import {proxy} from "@odoo/owl";
import {user} from "@web/core/user";

patch(ControlPanel, {
    components: {...ControlPanel.components, FilterButton, Transition},
});

patch(ControlPanel.prototype, {
    setup() {
        super.setup(...arguments);
        const actionId = this.env.config.actionId;
        // Without an action (e.g. the "Search More..." dialog) the visibility
        // is only kept in memory, as there is no key to store it per view.
        this.buttonFiltersVisibilityKey =
            actionId && `visibleHeaderButtons${actionId}+${user.userId}`;
        let visible = false;
        if (this.buttonFiltersVisibilityKey) {
            try {
                visible = Boolean(
                    JSON.parse(
                        browser.localStorage.getItem(this.buttonFiltersVisibilityKey)
                    )
                );
            } catch {
                visible = false;
            }
        }
        this.headerButtonFiltersState = proxy({visible});
    },
    get headerButtonFilters() {
        return this.env.searchModel?.headerButtonFilters || [];
    },
    onClickToggleHeaderButtonFilters() {
        const visible = !this.headerButtonFiltersState.visible;
        this.headerButtonFiltersState.visible = visible;
        if (!this.buttonFiltersVisibilityKey) {
            return;
        }
        if (visible) {
            browser.localStorage.setItem(this.buttonFiltersVisibilityKey, true);
        } else {
            browser.localStorage.removeItem(this.buttonFiltersVisibilityKey);
        }
    },
});

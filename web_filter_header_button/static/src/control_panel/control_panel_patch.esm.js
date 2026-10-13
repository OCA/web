import {ControlPanel} from "@web/search/control_panel/control_panel";
import {FilterButton} from "../filter_button/filter_button.esm";
import {browser} from "@web/core/browser/browser";
import {patch} from "@web/core/utils/patch";
import {useState} from "@odoo/owl";
import {user} from "@web/core/user";

patch(ControlPanel, {
    components: {...ControlPanel.components, FilterButton},
});

patch(ControlPanel.prototype, {
    setup() {
        super.setup(...arguments);
        this.buttonFiltersVisibilityKey = `visibleHeaderButtons${this.env.config.actionId}+${user.userId}`;
        this.state = useState({
            ...this.state,
            headerButtonFilters: this.env.searchModel?.headerButtonFilters,
            showButtonFilters:
                this.env.searchModel?.headerButtonFilters.length > 0 &&
                Boolean(this.env.config.actionId) &&
                Boolean(
                    JSON.parse(
                        browser.localStorage.getItem(this.buttonFiltersVisibilityKey)
                    )
                ),
        });
    },
    onClickShowshowButtonFilters() {
        if (this.state.showButtonFilters) {
            browser.localStorage.removeItem(this.buttonFiltersVisibilityKey);
        } else {
            browser.localStorage.setItem(this.buttonFiltersVisibilityKey, true);
        }
        this.state.showButtonFilters = !this.state.showButtonFilters;
    },
});

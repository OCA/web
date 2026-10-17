/** @odoo-module **/

import {ControlPanel} from "@web/search/control_panel/control_panel";
import {FilterButton} from "../filter_button/filter_button";
import {patch} from "@web/core/utils/patch";
import {useState} from "@odoo/owl";

patch(ControlPanel, "web_filter_header_button.ControlPanel.components", {
    components: {
        ...ControlPanel.components,
        FilterButton,
    },
});

patch(ControlPanel.prototype, "web_filter_header_button.ControlPanel", {
    setup() {
        this._super(...arguments);
        this.state = useState({
            ...(this.state || {}),
            showButtonFilters: false,
        });
        this._hbfUserToggled = false;
        this.onClickToggleHeaderButtons = this.onClickToggleHeaderButtons.bind(this);
    },

    /**
     * Always show by default when header button filters exist.
     * If user toggles, respect the toggled value afterward.
     */
    get hbfShowButtonFilters() {
        const headerButtonFilters =
            (this.env &&
                this.env.searchModel &&
                this.env.searchModel.headerButtonFilters) ||
            [];
        if (!headerButtonFilters.length) {
            return false;
        }
        if (!this._hbfUserToggled) {
            return true;
        }
        return this.state.showButtonFilters;
    },

    onClickToggleHeaderButtons() {
        const currentlyVisible = this.hbfShowButtonFilters;
        this._hbfUserToggled = true;
        this.state.showButtonFilters = !currentlyVisible;
    },
});

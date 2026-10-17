/** @odoo-module **/

import {Component} from "@odoo/owl";

export class FilterButton extends Component {
    setup() {
        this.model = this.env.searchModel;
    }

    /**
     * Return custom properties depending on the filter properties
     *
     * @param {Object} filter
     * @returns {Object}
     */
    mapFilterType(filter) {
        const mapping = {
            filter: {
                color: "primary",
            },
            favorite: {
                color: "warning",
            },
            groupBy: {
                color: "info",
            },
        };
        return mapping[filter.type];
    }

    /**
     * Clear filters
     */
    onClickReset() {
        this.model.clearQuery();
    }

    /**
     * Return whether the filter should behave exclusively in the header panel.
     *
     * @param {Object} filter
     * @returns {Boolean}
     */
    isExclusiveInPanel(filter) {
        return Boolean(filter && filter.context && filter.context.exclusive_in_panel);
    }

    /**
     * Deactivate the other active exclusive header buttons.
     *
     * @param {Object} currentFilter
     */
    deactivateOtherExclusiveFilters(currentFilter) {
        const exclusiveFilters = this.model
            .getHeaderButtonFilters()
            .filter(
                (filter) =>
                    filter.id !== currentFilter.id &&
                    this.isExclusiveInPanel(filter) &&
                    filter.isActive
            );
        for (const filter of exclusiveFilters) {
            this.model.toggleSearchItem(filter.id);
        }
    }

    /**
     * Set / unset filter
     *
     * If `exclusive_in_panel` is enabled on the clicked filter, all other
     * active exclusive header buttons are deactivated first.
     *
     * @param {Object} filter
     */
    onToggleFilter(filter) {
        if (this.isExclusiveInPanel(filter)) {
            this.deactivateOtherExclusiveFilters(filter);
        }
        this.model.toggleSearchItem(filter.id);
    }
}

FilterButton.template = "filter_button.FilterButton";
FilterButton.props = {
    filters: {type: Object, optional: false},
};

/** @odoo-module **/
const {Component} = owl;

export class FilterButton extends Component {
    setup() {
        this.model = this.env.searchModel;
    }
    /**
     * Filter flagged filters to be shown in the control panel.
     *
     * @param {Array} filters
     * @returns {Array}
     */
    shownFilters(filters) {
        return filters.filter((filter) => {
            return filter.context && filter.context.shown_in_panel;
        });
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
        this.model.dispatch("clearQuery");
    }
    /**
     * Set / unset filter
     * @param {Object} filter
     */
    onToggleFilter(filter) {
        this.model.dispatch("toggleFilter", filter.id);
    }
}
FilterButton.template = "filter_button.FilterButton";

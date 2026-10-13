import {Component} from "@odoo/owl";

export class FilterButton extends Component {
    static template = "filter_button.FilterButton";
    static props = {
        filters: {type: Object, optional: false},
    };
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
     * Set / unset filter
     * @param {Object} filter
     */
    onToggleFilter(filter) {
        this.model.toggleSearchItem(filter.id);
    }
}

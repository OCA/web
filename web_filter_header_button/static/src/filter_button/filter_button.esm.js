import {Component, t, useProps} from "@odoo/owl";

const COLOR_BY_TYPE = {
    favorite: "warning",
    groupBy: "info",
    dateGroupBy: "info",
};
// Not migrated Font Awesome icons (`fa-star`, `fa fa-star`...)
const LEGACY_ICON_RE = /(^|\s)fa-/;

export class FilterButton extends Component {
    static template = "filter_button.FilterButton";
    props = useProps({
        filters: t.array(t.object()),
    });

    setup() {
        this.model = this.env.searchModel;
    }

    /**
     * @param {Object} filter
     * @returns {String} bootstrap color for the button
     */
    getColor(filter) {
        return COLOR_BY_TYPE[filter.type] || "primary";
    }

    /**
     * @param {Object} filter
     * @returns {Object} button options set in the `shown_in_panel` context key
     */
    getOptions(filter) {
        const options = filter.context.shown_in_panel;
        if (typeof options !== "object") {
            return {};
        }
        // Font Awesome isn't available anymore, so the old `fa-*` and
        // `fa fa-*` icons would be rendered as plain text.
        if (LEGACY_ICON_RE.test(options.icon)) {
            return {...options, icon: false};
        }
        return options;
    }

    onClickReset() {
        this.model.clearQuery();
    }

    /**
     * @param {Object} filter
     */
    onToggleFilter(filter) {
        this.model.toggleHeaderButtonFilter(filter.id);
    }
}

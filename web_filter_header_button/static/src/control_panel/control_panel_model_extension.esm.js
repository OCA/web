/** @odoo-module **/
import LegacyControlPanelModelExtension from "web/static/src/js/control_panel/control_panel_model_extension.js";
import {patch} from "web.utils";

patch(
    LegacyControlPanelModelExtension.prototype,
    "filter_button.ControlPanelModelExtension",
    {
        /**
         * Clean the `show_in_panel` context to avoid showing it in the panel
         * @private
         * @override
         * @param {Object} preFilter
         * @returns {Promise<Object>}
         */
        async _saveQuery() {
            const preFilter = await this._super(...arguments);
            if (preFilter && preFilter.context) {
                delete preFilter.context.shown_in_panel;
            }
            return preFilter;
        },
        /**
         * Clear the `show_in_panel` context to prevent it being saved with this context
         * @override
         * @returns {Object}
         */
        getIrFilterValues() {
            const preFilter = this._super(...arguments);
            if (preFilter && preFilter.context) {
                delete preFilter.context.shown_in_panel;
            }
            return preFilter;
        },
        /**
         * Allow groupBy filters to show up as buttons
         * @override
         * @param {Object} filter
         * @param {Object} attrs
         */
        _extractAttributes(filter, attrs) {
            this._super(...arguments);
            if (filter.type === "groupBy" && attrs.context.shown_in_panel) {
                filter.context = attrs.context;
            }
        },
    }
);

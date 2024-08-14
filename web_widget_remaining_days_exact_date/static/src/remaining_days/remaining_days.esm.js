/** @odoo-module **/
/* Copyright 2024 Tecnativa - Carlos Roca
 * License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl). */
import {RemainingDaysField} from "@web/views/fields/remaining_days/remaining_days_field";
import {patch} from "@web/core/utils/patch";
import {sprintf} from "@web/core/utils/strings";

patch(
    RemainingDaysField.prototype,
    "web_widget_remaining_days_exact_date.RemainingDaysField",
    {
        get diffString() {
            var value = this._super(...arguments);
            // 99 is hardcoded because Odoo uses this value to display the exact
            // date at this point
            // https://github.com/odoo/odoo/blob/9cb802340f7a769327e9e5f0c4085cb837269551/addons/web/static/src/views/fields/remaining_days/remaining_days_field.js#L42
            if (value && this.props.exact_date && Math.abs(this.diffDays) <= 99) {
                value = sprintf("%s (%s)", value, this.formattedValue);
            }
            return value;
        },
    }
);
RemainingDaysField.props = {
    ...RemainingDaysField.props,
    exact_date: {type: Boolean, optional: true},
};
RemainingDaysField.defaultProps = {
    ...RemainingDaysField.defaultProps,
    exact_date: true,
};
const superExtractProps = RemainingDaysField.extractProps;
RemainingDaysField.extractProps = ({attrs}) => {
    var res = {};
    if (superExtractProps) {
        res = superExtractProps({attrs});
    }
    return {
        ...res,
        exact_date: attrs.options.exact_date,
    };
};

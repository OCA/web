/** @odoo-module **/

import {patch} from "@web/core/utils/patch";
import {BooleanField} from "@web/views/fields/boolean/boolean_field";

patch(BooleanField.prototype, "web_widget_x2many_2d_matrix", {
    get isReadonly() {
        if (this.props.record.bypass_readonly) {
            return false;
        }
        return this._super(...arguments);
    },
});

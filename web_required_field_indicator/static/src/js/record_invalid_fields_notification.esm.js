/** @odoo-module **/

import {Record} from "@web/views/basic_relational_model";
import {escape} from "@web/core/utils/strings";
import {markup} from "@odoo/owl";
import {patch} from "@web/core/utils/patch";

// Core hardcodes the notification title as "Invalid fields: ", which is
// misleading: an empty required field is not invalid, it is simply
// unfilled. There is no hook to override only the title, so the method is
// replicated here with corrected wording (odoo/addons/web/static/src/views
// /basic_relational_model.js, Record.openInvalidFieldsNotification).
patch(Record.prototype, "web_required_field_indicator.Record", {
    openInvalidFieldsNotification() {
        if (this._invalidFields.size) {
            const invalidFields = [...this._invalidFields].map((fieldName) => {
                return `<li>${escape(this.fields[fieldName].string || fieldName)}</li>`;
            }, this);
            this._closeInvalidFieldsNotification = this.model.notificationService.add(
                markup(`<ul>${invalidFields.join("")}</ul>`),
                {
                    title: this.model.env._t("Required fields not filled: "),
                    type: "danger",
                }
            );
        }
    },
});

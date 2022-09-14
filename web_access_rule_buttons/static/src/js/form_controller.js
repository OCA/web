/* Copyright 2016 Camptocamp SA
 * License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl). */

odoo.define("web_access_rule_buttons.main", function (require) {
    "use strict";

    var FormController = require("web.FormController");

    FormController.include({
        async _update(state, params) {
            const res = await this._super(state, params);
            await this.show_hide_buttons(state);
            return res;
        },
        async show_hide_buttons(state) {
            const accesses = await this._rpc({
                model: this.modelName,
                method: "check_access_rule_all",
                args: [[state.data.id], ["write"]],
            });
            this.show_hide_edit_button(accesses.write);
        },
        show_hide_edit_button(access) {
            if (this.$buttons) {
                const button = this.$buttons.find(".o_form_button_edit");
                if (button) {
                    button.prop("disabled", !access);
                }
            }
        },
    });
});

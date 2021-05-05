/* Copyright 2016 Camptocamp SA
 * License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl). */

odoo.define("web_access_rule_buttons.main", function (require) {
    "use strict";
    var FormController = require("web.FormController");
    FormController.include({
        async _update(state, params) {
            return this._super(state, params).then(this.show_hide_buttons(state));
        },
        show_hide_buttons: function (state) {
            var self = this;
            return self
                ._rpc({
                    model: this.modelName,
                    method: "check_access_rule_all",
                    args: [[state.data.id], ["write"]],
                })
                .then(function (accesses) {
                    self.show_hide_edit_button(accesses.write);
                });
        },
        show_hide_edit_button: function (access) {
            if (this.$buttons) {
                var button = this.$buttons.find(".o_form_button_edit");
                if (button) {
                    button.prop("disabled", !access);
                }
            }
        },
    });
});

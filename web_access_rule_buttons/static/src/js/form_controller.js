/* Copyright 2016 Camptocamp SA
 * License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl). */

odoo.define("web_access_rule_buttons.main", function(require) {
    "use strict";
    var FormController = require("web.FormController");
    FormController.include({

        _update: function () {
            var self = this;
            var ret = this._super.apply(this, arguments);
            self.show_hide_buttons();
            return ret;
        },
        show_hide_buttons : function() {
            var self = this;
            return self._rpc({
                model: this.modelName,
                method: 'check_access_rule_all',
                args: [[this.initialState.data.id], ["write"]],
            }).then(function(accesses) {
                self.show_hide_edit_button(accesses.write);
            });
        },
        show_hide_edit_button : function(access) {
            if (this.$buttons) {
                var button = this.$buttons.find(".o_form_button_edit");
                if (button) {
                    button.prop("disabled", !access);
                }
            }
        }

    });
});

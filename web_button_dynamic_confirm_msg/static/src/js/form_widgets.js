/* Copyright 2017 ACSONE SA/NV
 *  * License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl). */

odoo.define('web.button_dynamic_confirm_msg', function (require) {
    "use strict";

    var Dialog = require('web.Dialog'),
        form_widget = require('web.form_widgets');

    form_widget.WidgetButton.include({
        start: function() {
            this._super.apply(this, arguments);
        },
        execute_action: function() {
            var self = this;
            var exec_action = function() {
                if (self.node.attrs.confirm || self.node.attrs.confirm_field) {
                    var confirm_msg;
                    // if the confirm_field attribute is set get the value of that field
                    // else skip the confirmation dialog
                    if(self.node.attrs.confirm_field){
                        confirm_msg = self.view.datarecord[self.node.attrs.confirm_field];
                        if (! confirm_msg){
                            return self.on_confirmed();
                        }
                    } else {
                        confirm_msg = self.node.attrs.confirm
                    }
                    var def = $.Deferred();
                    Dialog.confirm(self, confirm_msg, { confirm_callback: self.on_confirmed })
                          .on("closed", null, function() { def.resolve(); });
                    return def.promise();
                } else {
                    return self.on_confirmed();
                }
            };
            if (!this.node.attrs.special) {
                return this.view.recursive_save().then(exec_action);
            } else {
                return exec_action();
            }
        },

    })
});
odoo.define("web_hide_on_edit.form_controller", function (require) {
    "use strict";
    var FormController = require("web.FormController");
    FormController.include({
        updateButtons: function () {
            this._super();
            var edit_mode = this.mode === "edit";
            var buttons = this.$(".o_hide_on_edit");
            buttons.toggleClass("o_hidden", edit_mode);
        },
    });
});

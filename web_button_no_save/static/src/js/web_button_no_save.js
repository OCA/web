odoo.define("web_button_no_save.FormController", function (require) {
    "use strict";

    var FormController = require("web.FormController");

    FormController.include({
        _onButtonClicked: function (event) {
            var attrs = event.data.attrs;
            if (attrs.no_save) {
                event.stopPropagation();
                this._disableButtons();
                var def = this._callButtonAction(attrs, event.data.record);
                def.finally(this._enableButtons.bind(this));
            } else {
                return this._super.apply(this, arguments);
            }
        },
    });
});

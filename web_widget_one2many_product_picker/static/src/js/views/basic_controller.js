// Copyright 2021 Tecnativa - Alexandre Díaz
// License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).
odoo.define("web_widget_one2many_product_picker.BasicController", function(require) {
    "use strict";

    const BasicController = require("web.BasicController");

    BasicController.include({
        /**
         * This is necessary to refresh 'one2many_product_picker' when some 'trigger_refresh_fields' fields changes.
         *
         * @override
         */
        _confirmChange: function(id, fields, e) {
            id = id || this.handle;
            var self = this;
            return this._super.apply(this, arguments).then(function () {
                if (self.renderer && !_.isEmpty(self.renderer.allFieldWidgets)) {
                    var product_picker_widgets = _.filter(
                        self.renderer.allFieldWidgets[id],
                        item => item.attrs.widget === "one2many_product_picker"
                    );
                    _.invoke(
                        product_picker_widgets,
                        "onDocumentConfirmChanges",
                        fields,
                        e
                    );
                }
            });
        },
    });
});

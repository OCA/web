/* global py */
// Copyright 2020 Tecnativa - Alexandre Díaz
// License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).
odoo.define("web_widget_one2many_product_picker.FormRenderer", function(require) {
    "use strict";

    var FormRenderer = require("web.FormRenderer");


    FormRenderer.include({
        /**
         * Invoke the selected method on all product picer defined
         */
        invokeProductPicker: function(recordID, method_name, ...params) {
            if (_.isEmpty(this.allFieldWidgets)) {
                return;
            }
            var product_picker_widgets = _.filter(
                this.allFieldWidgets[recordID],
                function(item) {
                    return item.attrs.widget === "one2many_product_picker";
                }
            );
            _.invoke(
                product_picker_widgets,
                method_name,
                ...params
            );
        },
    });
});

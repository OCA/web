// Copyright 2020 Tecnativa - Alexandre Díaz
// License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).
odoo.define("web_widget_one2many_product_picker_sale_stock.FieldOne2ManyProductPicker", function (
    require
) {
    "use strict";

    var FieldOne2ManyProductPicker = require("web_widget_one2many_product_picker.FieldOne2ManyProductPicker");

    FieldOne2ManyProductPicker.include({
        /**
         * @override
         */
        _getDefaultOptions: function () {
            var defaults = this._super.apply(this, arguments);
            defaults["show_sale_stock"] = false;
            return defaults;
        },
    });
});

// Copyright 2020 Tecnativa - Alexandre Díaz
// License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).
odoo.define("web_widget_one2many_product_picker_sale_stock.One2ManyProductPickerRecord", function (
    require
) {
    "use strict";

    var One2ManyProductPickerRecord = require(
        "web_widget_one2many_product_picker.One2ManyProductPickerRecord");

    One2ManyProductPickerRecord.include({
        /**
         * @override
         */
        _getQWebContext: function () {
            var qweb_context = this._super.apply(this, arguments);
            qweb_context["show_sale_stock"] = this.options.showSaleStock;
            return qweb_context;
        },
    });
});

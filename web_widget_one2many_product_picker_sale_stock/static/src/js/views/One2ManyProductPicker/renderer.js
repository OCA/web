// Copyright 2020 Tecnativa - Alexandre Díaz
// License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).
odoo.define("web_widget_one2many_product_picker_sale_stock.One2ManyProductPickerRenderer", function (require) {
    "use strict";

    var One2ManyProductPickerRenderer = require("web_widget_one2many_product_picker.One2ManyProductPickerRenderer");

    One2ManyProductPickerRenderer.include({
        /**
         * @override
         */
        _getRecordOptions: function (search_record) {
            var options = this._super.apply(this, arguments);
            options["showSaleStock"] = this.options.show_sale_stock;
            return options
        },
    });
});

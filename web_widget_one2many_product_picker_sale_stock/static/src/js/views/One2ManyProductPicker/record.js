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
            qweb_context.show_sale_stock = this.options.showSaleStock;
            return qweb_context;
        },

        /**
         * @override
         */
        on_detach_callback: function () {
            if (!_.isEmpty(this.widgets.front)) {
                for (var index in this.widgets.front) {
                    var widget = this.widgets.front[index];
                    if (widget.template === 'sale_stock.qtyAtDate') {
                        widget.$el.popover("hide");
                    }
                }
            }
            this._super.apply(this, arguments);
        },

        /**
         * @override
         */
        destroy: function () {
            this.on_detach_callback();
            this._super.apply(this, arguments);
        },
    });
});

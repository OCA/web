// Copyright 2022 Tecnativa - Alexandre Díaz
// License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).
odoo.define("web_widget_one2many_product_picker_sale_stock.QtyAtDateWidget", function (
    require
) {
    "use strict";

    var QtyAtDateWidget = require('sale_stock.QtyAtDateWidget');

    QtyAtDateWidget.include({
        on_detach_callback: function() {
            if (this.$el) {
                this.$el.popover("dispose");
            }
        },
    });
});

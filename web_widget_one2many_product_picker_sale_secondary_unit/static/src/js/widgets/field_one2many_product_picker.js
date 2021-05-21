// Copyright 2021 Tecnativa - Alexandre Díaz
// License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).
odoo.define(
    "web_widget_one2many_product_picker_sale_secondary_unit.FieldOne2ManyProductPicker",
    function(require) {
        "use strict";

        const FieldOne2ManyProductPicker = require("web_widget_one2many_product_picker.FieldOne2ManyProductPicker");

        FieldOne2ManyProductPicker.include({
            // Model product.product fields
            search_read_fields: _.unique(
                [].concat(FieldOne2ManyProductPicker.prototype.search_read_fields, [
                    "sale_secondary_uom_id",
                ])
            ),

            /**
             * @private
             * @returns {Object}
             */
            _getDefaultOptions: function() {
                const res = this._super.apply(this, arguments);
                res.field_map.secondary_uom = "secondary_uom_id";
                res.field_map.secondary_uom_qty = "secondary_uom_qty";
                return res;
            },
        });
    }
);

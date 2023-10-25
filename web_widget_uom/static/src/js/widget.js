/* Copyright 2022 Giovanni Serra
License LGPLv3.0 or later (https://www.gnu.org/licenses/lgpl-3.0.en.html). */

/* Global jscolor */
odoo.define("web.web_widget_uom", function (require) {
    "use strict";

    var basic_fields = require("web.basic_fields");
    var field_registry = require("web.field_registry");

    var FieldUoM = basic_fields.FieldFloat.extend({
        willStart: function () {
            return Promise.all([
                this._getDecimalPlaces(),
                this._super.apply(this, arguments),
            ]);
        },
        _getDecimalPlaces: function () {
            var self = this;
            var uomField =
                this.nodeOptions.uom_field || this.field.uom_field || "uom_id";
            var uomID = this.record.data[uomField] && this.record.data[uomField].res_id;

            var qtyField = this.nodeOptions.qty_field || "product_uom_qty";
            var quantity = this.record.data[qtyField] || 0.0;

            return this._rpc({
                model: "uom.uom",
                method: "get_decimal_places",
                args: [, uomID, quantity],
            }).then(function (result) {
                if (result !== null) {
                    self.nodeOptions.digits = [32, result];
                }
            });
        },
    });

    field_registry.add("uom", FieldUoM);

    return {
        FieldUoM: FieldUoM,
    };
});

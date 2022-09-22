// Copyright 2021 Tecnativa - Alexandre Díaz
// License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).
odoo.define(
    "web_widget_one2many_product_picker_sale_elaboration.FieldOne2ManyProductPicker",
    function(require) {
        "use strict";

        const FieldOne2ManyProductPicker = require("web_widget_one2many_product_picker.FieldOne2ManyProductPicker");

        FieldOne2ManyProductPicker.include({
            /**
             * @private
             * @returns {Object}
             */
            _getDefaultOptions: function() {
                const res = this._super.apply(this, arguments);
                res.field_map.elaboration = "elaboration_id";
                res.field_map.elaboration_note = "elaboration_note";
                return res;
            },
        });
    }
);

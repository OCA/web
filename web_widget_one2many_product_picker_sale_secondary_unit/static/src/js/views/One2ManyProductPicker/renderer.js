// Copyright 2021 Tecnativa - Alexandre Díaz
// License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).
odoo.define(
    "web_widget_one2many_product_picker_sale_secondary_unit.One2ManyProductPickerRenderer",
    function(require) {
        "use strict";

        const One2ManyProductPickerRenderer = require("web_widget_one2many_product_picker.One2ManyProductPickerRenderer");

        One2ManyProductPickerRenderer.include({
            _isEqualState: function(state_a, state_b) {
                const res = this._super.apply(this, arguments);
                const secondary_uom_id_a =
                    state_a.data.secondary_uom_id &&
                    state_a.data.secondary_uom_id.data.id;
                const secondary_uom_id_b =
                    state_b.data.secondary_uom_id &&
                    state_b.data.secondary_uom_id.data.id;
                return res && secondary_uom_id_a === secondary_uom_id_b;
            },
        });
    }
);

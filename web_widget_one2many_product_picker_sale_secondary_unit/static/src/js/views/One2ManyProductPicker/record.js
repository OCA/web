// Copyright 2021 Tecnativa - Alexandre Díaz
// License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).
odoo.define(
    "web_widget_one2many_product_picker_sale_secondary_unit.One2ManyProductPickerRecord",
    function(require) {
        "use strict";

        const One2ManyProductPickerRecord = require("web_widget_one2many_product_picker.One2ManyProductPickerRecord");

        One2ManyProductPickerRecord.include({
            /**
             * @override
             */
            _setMasterUomMap: function() {
                this._super.apply(this, arguments);
                if (
                    (this.state &&
                        this.state.data &&
                        this.state.data.secondary_uom_id) ||
                    (!this.state &&
                        this.recordSearch &&
                        this.recordSearch.sale_secondary_uom_id)
                ) {
                    _.extend(this.master_uom_map, {
                        field_uom: "secondary_uom",
                        field_uom_qty: "secondary_uom_qty",
                        search_field_uom: "sale_secondary_uom_id",
                    });
                }
            },
        });
    }
);

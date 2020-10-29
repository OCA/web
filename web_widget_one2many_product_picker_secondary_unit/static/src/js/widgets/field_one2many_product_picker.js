odoo.define("web_widget_one2many_product_picker_secondary_unit.FieldOne2ManyProductPicker", function (
    require
) {
    "use strict";

    var FieldOne2Many = require("web.relational_fields").FieldOne2Many;
    var FieldOne2ManyProductPicker = require("web_widget_one2many_product_picker.FieldOne2ManyProductPicker");

    FieldOne2ManyProductPicker.include({
        // search_read_fields: _.union(FieldOne2ManyProductPicker.prototype.search_read_fields, [
        //     "secondary_uom_id",
        //     "secondary_uom_qty",
        // ]),

        _getDefaultOptions: function () {
            var defaults = this._super.apply(this, arguments);
            defaults.field_map = _.extend({
                secondary_uom_id: "secondary_uom_id",
                secondary_uom_qty: "secondary_uom_qty",
            }, defaults.field_map);
            return defaults;
        },
    });
});

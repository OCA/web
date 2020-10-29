// Copyright 2020 Tecnativa - Alexandre Díaz
// License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).
odoo.define("web_widget_one2many_product_picker_secondary_unit.ProductPickerQuickCreateForm", function (require) {
    "use strict";

    /**
     * This widget render a Form. Used by FieldOne2ManyProductPicker
     */
    var ProductPickerQuickCreateForm = require("web_widget_one2many_product_picker.ProductPickerQuickCreateForm");

    ProductPickerQuickCreateForm.include({
        // xmlDependencies: _.union(ProductPickerQuickCreateForm.prototype.xmlDependencies, [
        //     "/web_widget_one2many_product_picker_secondary_unit/static/src/xml/one2many_product_picker_quick_create.xml",
        // ]),

        // _get_view_default_values: function () {
        //     var defaults = this._super.apply(this, arguments);
        //     defaults['default_' + this.fieldMap.secondary_uom_id] = this.state && this.state.data[this.fieldMap.secondary_uom_id].data.id || null;
        //     return defaults;
        // },
    });
});

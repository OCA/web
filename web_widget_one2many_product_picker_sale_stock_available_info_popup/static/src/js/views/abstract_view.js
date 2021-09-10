// Copyright 2020 Tecnativa - Alexandre Díaz
// License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).
odoo.define("web_widget_one2many_product_picker_sale_stock_available_info_popup.AbstractView", function(
    require
) {
    "use strict";

    const AbstractView = require("web.AbstractView");
    require("web_widget_one2many_product_picker_sale_stock.AbstractView");

    /**
     * Helper function to create field view definitions
     *
     * @private
     * @param {Object} params
     * @returns {Object}
     */
    function _constructFakeFieldDef(params) {
        return _.extend(
            {
                change_default: false,
                company_dependent: false,
                manual: false,
                views: {},
                searchable: true,
                store: false,
                readonly: true,
                required: false,
                sortable: false,
            },
            params
        );
    }

    /**
     * This is pure hard-coded magic. Adds new fields to the widget form view.
     */
    AbstractView.include({
        /**
         * @private
         * @param {Object} viewInfo
         */
        _injectSaleStockFields: function(viewInfo) {
            this._super.apply(this, arguments);

            const to_inject = {
                immediately_usable_qty_today: _constructFakeFieldDef({
                    depends: [
                        "product_id",
                        "product_uom_qty",
                    ],
                    type: "float",
                }),
            };
            viewInfo.viewFields.order_line.views.form.fields = _.extend(
                {},
                to_inject,
                viewInfo.viewFields.order_line.views.form.fields
            );

            // Add fields to arch
            const field_names = Object.keys(to_inject);
            const $arch = $(viewInfo.viewFields.order_line.views.form.arch);
            for (const index in field_names) {
                var field_name = field_names[index];
                var $field = $arch.find("field[name='" + field_name + "']");
                if (!$field.length) {
                    $("<FIELD/>", {
                        name: field_name,
                        invisible: 1,
                        modifiers: '{"invisible": true}',
                    }).appendTo($arch);
                }
            }
            viewInfo.viewFields.order_line.views.form.arch = $arch[0].outerHTML;
        },
    });
});

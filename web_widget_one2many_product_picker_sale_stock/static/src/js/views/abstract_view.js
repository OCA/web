// Copyright 2020 Tecnativa - Alexandre Díaz
// License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).
odoo.define("web_widget_one2many_product_picker_sale_stock.AbstractView", function (require) {
    "use strict";

    var AbstractView = require("web.AbstractView");

    /**
     * Helper function to create field view definitions
     *
     * @private
     * @param {Object} params
     * @returns {Object}
     */
    function _constructFakeFieldDef(params) {
        return _.extend({
            change_default: false,
            company_dependent: false,
            manual: false,
            views: {},
            searchable: true,
            store: false,
            readonly: true,
            required: false,
            sortable: false,
        }, params);
    }

    /**
     * This is pure hard-coded magic. Adds new fields to the widget form view.
     */
    AbstractView.include({
        /**
         * @override
         */
        init: function (viewInfo, params) {
            if (viewInfo.model === 'sale.order') {
                var widget_name = $(viewInfo.arch).find("field[name='order_line']").attr("widget");
                if (widget_name === "one2many_product_picker") {
                    this._injectSaleStockFields(viewInfo);
                }
                return this._super(viewInfo, params);
            }
            this._super.apply(this, arguments);
        },

        /**
         * @private
         * @param {Object} viewInfo
         */
        _injectSaleStockFields: function (viewInfo) {
            var to_inject = {
                product_type: _constructFakeFieldDef({
                    depends: ["product_id.type"],
                    related: ["product_id", "type"],
                    type: "selection",
                }),
                virtual_available_at_date: _constructFakeFieldDef({
                    depends: [
                        "product_id",
                        "customer_lead",
                        "product_uom_qty",
                        "order_id.warehouse_id",
                        "order_id.commitment_date"
                    ],
                    type: "float",
                }),
                qty_available_today: _constructFakeFieldDef({
                    depends: [
                        "product_id",
                        "customer_lead",
                        "product_uom_qty",
                        "order_id.warehouse_id",
                        "order_id.commitment_date"
                    ],
                    type: "float",
                }),
                free_qty_today: _constructFakeFieldDef({
                    depends: [
                        "product_id",
                        "customer_lead",
                        "product_uom_qty",
                        "order_id.warehouse_id",
                        "order_id.commitment_date"
                    ],
                    type: "float",
                }),
                scheduled_date: _constructFakeFieldDef({
                    depends: [
                        "product_id",
                        "customer_lead",
                        "product_uom_qty",
                        "order_id.warehouse_id",
                        "order_id.commitment_date"
                    ],
                    type: "datetime",
                }),
                warehouse_id: _constructFakeFieldDef({
                    depends: [
                        "product_id",
                        "product_uom_qty",
                        "qty_delivered",
                        "state"
                    ],
                    relation: "stock.warehouse",
                    type: "many2one",
                }),
                qty_to_deliver: _constructFakeFieldDef({
                    depends: [
                        "product_id",
                        "customer_lead",
                        "product_uom_qty",
                        "order_id.warehouse_id",
                        "order_id.commitment_date"
                    ],
                    group_operator: "sum",
                    type: "float",
                }),
                is_mto: _constructFakeFieldDef({
                    depends: [
                        "product_id",
                        "route_id",
                        "order_id.warehouse_id",
                        "product_id.route_ids"
                    ],
                    type: "boolean",
                }),
                display_qty_widget: _constructFakeFieldDef({
                    depends: [
                        "product_id",
                        "product_uom_qty",
                        "qty_delivered",
                        "state"
                    ],
                    type: "boolean",
                }),
            };
            viewInfo.viewFields.order_line.views.form.fields =
                _.extend({}, to_inject, viewInfo.viewFields.order_line.views.form.fields);

            // Add fields to arch
            var field_names = Object.keys(to_inject);
            var $arch = $(viewInfo.viewFields.order_line.views.form.arch);
            for (var index in field_names) {
                var field_name = field_names[index];
                var $field = $arch.find("field[name='"+field_name+"']");
                if (!$field.length) {
                    $("<FIELD/>", {
                        name: field_name,
                        invisible: 1,
                        modifiers: "{\"invisible\": true}",
                    }).appendTo($arch);
                }
            }
            viewInfo.viewFields.order_line.views.form.arch = $arch[0].outerHTML;
        }
    });

});

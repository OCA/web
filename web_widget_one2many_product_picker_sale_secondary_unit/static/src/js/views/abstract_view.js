// Copyright 2020 Tecnativa - Alexandre Díaz
// License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).
odoo.define(
    "web_widget_one2many_product_picker_sale_secondary_unit.AbstractView",
    function(require) {
        "use strict";

        const core = require("web.core");
        const AbstractView = require("web.AbstractView");

        const _t = core._t;

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
             * @override
             */
            init: function(viewInfo, params) {
                if (viewInfo.model === "sale.order") {
                    const widget_name = $(viewInfo.arch)
                        .find("field[name='order_line']")
                        .attr("widget");
                    if (widget_name === "one2many_product_picker") {
                        this._injectSaleSecondaryUnitFields(viewInfo);
                    }
                    return this._super(viewInfo, params);
                }
                this._super.apply(this, arguments);
            },

            /**
             * @private
             * @param {Object} viewInfo
             */
            _injectSaleSecondaryUnitFields: function(viewInfo) {
                const to_inject = {
                    product_id_secondary_uom_ids: _constructFakeFieldDef({
                        context: {},
                        depends: ["product_id.secondary_uom_ids"],
                        domain: [],
                        manual: false,
                        related: ["product_id", "secondary_uom_ids"],
                        relation: "product.secondary.unit",
                        type: "one2many",
                    }),
                    secondary_uom_qty: _constructFakeFieldDef({
                        depends: [],
                        string: _t("Secondary Qty"),
                        group_operator: "sum",
                        digits: [16, 3],
                        store: true,
                        readonly: false,
                        type: "float",
                    }),
                    secondary_uom_id: _constructFakeFieldDef({
                        depends: [],
                        relation: "product.secondary.unit",
                        string: _t("Secondary uom"),
                        store: true,
                        readonly: false,
                        type: "many2one",
                    }),
                };
                viewInfo.viewFields.order_line.views.form.fields = _.extend(
                    {},
                    to_inject,
                    viewInfo.viewFields.order_line.views.form.fields
                );

                // Add fields to arch
                const $arch = $(viewInfo.viewFields.order_line.views.form.arch);

                // Add product_id_secondary_uom_ids?
                let $field = $arch.find("field[name='product_id_secondary_uom_ids']");
                if (!$field.length) {
                    $("<FIELD/>", {
                        name: "product_id_secondary_uom_ids",
                        invisible: 1,
                        modifiers: '{"invisible": true, "readonly": true}',
                    }).prependTo($arch);
                }
                // Add secondary_uom_id?
                $field = $arch.find("field[name='secondary_uom_id']");
                if (!$field.length) {
                    $("<FIELD/>", {
                        name: "secondary_uom_id",
                        options:
                            "{'no_open': True, 'no_create': True, 'no_edit': True}",
                        "t-attf-domain":
                            "[['product_variant_ids', 'in', [{{record_search.id}}]]]",
                        class: "mb-1",
                        on_change: 1,
                        can_create: "true",
                        can_write: "true",
                        store: true,
                        sortable: false,
                        readonly: false,
                        attrs:
                            '{"invisible": [["product_id_secondary_uom_ids", "=", False]]}',
                        modifiers:
                            '{"invisible": [["product_id_secondary_uom_ids", "=", false]]}',
                    }).prependTo($arch);
                }
                // Add secondary_uom_qty?
                $field = $arch.find("field[name='secondary_uom_qty']");
                if (!$field.length) {
                    $("<FIELD/>", {
                        name: "secondary_uom_qty",
                        on_change: 1,
                        class: "mb-1",
                        widget: "numeric_step",
                        attrs:
                            '{"invisible": [["product_id_secondary_uom_ids", "=", False]]}',
                        modifiers:
                            '{"invisible": [["product_id_secondary_uom_ids", "=", false]]}',
                        store: true,
                        sortable: false,
                        readonly: false,
                    }).prependTo($arch);
                }

                viewInfo.viewFields.order_line.views.form.arch = $arch[0].outerHTML;
            },
        });
    }
);

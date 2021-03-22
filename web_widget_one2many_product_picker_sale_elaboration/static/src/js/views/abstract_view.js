// Copyright 2020 Tecnativa - Alexandre Díaz
// License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).
odoo.define(
    "web_widget_one2many_product_picker_sale_elaboration.AbstractView",
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
                        this._injectSaleElaborationFields(viewInfo);
                    }
                    return this._super(viewInfo, params);
                }
                this._super.apply(this, arguments);
            },

            /**
             * @private
             * @param {Object} viewInfo
             */
            _injectSaleElaborationFields: function(viewInfo) {
                const to_inject = {
                    is_elaboration: _constructFakeFieldDef({
                        depends: [],
                        type: "boolean",
                    }),
                    elaboration_id: _constructFakeFieldDef({
                        depends: [],
                        relation: "product.elaboration",
                        string: _t("Elaboration"),
                        store: true,
                        sortable: false,
                        readonly: false,
                        type: "many2one",
                    }),
                    elaboration_note: _constructFakeFieldDef({
                        depends: [],
                        translate: false,
                        string: _t("Elaboration Note"),
                        store: true,
                        sortable: false,
                        readonly: false,
                        type: "char",
                    }),
                };
                viewInfo.viewFields.order_line.views.form.fields = _.extend(
                    {},
                    to_inject,
                    viewInfo.viewFields.order_line.views.form.fields
                );

                // Add fields to arch
                const $arch = $(viewInfo.viewFields.order_line.views.form.arch);

                // Add is_elaboration?
                let $field = $arch.find("field[name='is_elaboration']");
                if (!$field.length) {
                    $("<FIELD/>", {
                        name: "is_elaboration",
                        invisible: 1,
                        force_save: 1,
                        modifiers: '{"invisible": true}',
                    }).appendTo($arch);
                }
                // Add elaboration_id?
                $field = $arch.find("field[name='elaboration_id']");
                if (!$field.length) {
                    $("<FIELD/>", {
                        name: "elaboration_id",
                        on_change: 1,
                        can_create: "true",
                        can_write: "true",
                        class: "mb-1",
                        attrs:
                            "{'invisible': [['is_elaboration', '!=', True]], 'readonly': [('state', 'in', ('done', 'cancel'))}",
                        modifiers:
                            '{"invisible": [["is_elaboration", "!=", true]], "readonly": [["state", "in", ["done", "cancel"]]]}',
                    }).appendTo($arch);
                }
                // Add elaboration_note?
                $field = $arch.find("field[name='elaboration_note']");
                if (!$field.length) {
                    $("<FIELD/>", {
                        name: "elaboration_note",
                        class: "mb-1",
                        attrs:
                            "{'invisible': [['is_elaboration', '!=', True]], 'readonly': [('state', 'in', ('done', 'cancel'))]}",
                        modifiers:
                            '{"invisible": [["is_elaboration", "!=", true]], "readonly": [["state", "in", ["done", "cancel"]]]}',
                    }).appendTo($arch);
                }

                viewInfo.viewFields.order_line.views.form.arch = $arch[0].outerHTML;
            },
        });
    }
);

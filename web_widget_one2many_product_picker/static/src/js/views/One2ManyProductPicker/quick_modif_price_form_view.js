// Copyright 2020 Tecnativa - Alexandre Díaz
// License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).
odoo.define(
    "web_widget_one2many_product_picker.ProductPickerQuickModifPriceFormView",
    function(require) {
        "use strict";

        /**
         * This file defines the QuickCreateFormView, an extension of the FormView that
         * is used by the RecordQuickCreate in One2ManyProductPicker views.
         */

        const QuickCreateFormView = require("web.QuickCreateFormView");
        const core = require("web.core");
        const tools = require("web_widget_one2many_product_picker.tools");

        const qweb = core.qweb;

        const ProductPickerQuickModifPriceFormRenderer = QuickCreateFormView.prototype.config.Renderer.extend(
            {
                /**
                 * @override
                 */
                start: function() {
                    this.$el.addClass(
                        "oe_one2many_product_picker_form_view o_xxs_form_view"
                    );
                    return this._super.apply(this, arguments).then(() => {
                        this._appendPrice();
                    });
                },

                /**
                 * @private
                 */
                _appendPrice: function() {
                    this.$el.find(".oe_price").remove();
                    this.$el.append(
                        qweb.render("One2ManyProductPicker.QuickModifPrice.Price")
                    );
                },
            }
        );

        const ProductPickerQuickModifPriceFormController = QuickCreateFormView.prototype.config.Controller.extend(
            {
                /**
                 * @override
                 */
                init: function(parent, model, renderer, params) {
                    this.fieldMap = params.fieldMap;
                    this.context = params.context;
                    this._super.apply(this, arguments);
                    this.currencyField = params.currencyField;
                    this.parentRecordData = params.parentRecordData;
                },

                /**
                 * @override
                 */
                start: function() {
                    return this._super.apply(this, arguments).then(() => {
                        const record = this.model.get(this.handle);
                        this._updatePrice(record.data);
                    });
                },

                /**
                 * @override
                 */
                _onFieldChanged: function(ev) {
                    this._super.apply(this, arguments);
                    const record = this.model.get(this.handle);
                    this._updatePrice(_.extend({}, record.data, ev.data.changes));
                },

                /**
                 * @private
                 * @param {Object} values
                 */
                _updatePrice: function(values) {
                    const price_reduce = tools.priceReduce(
                        values[this.fieldMap.price_unit],
                        values[this.fieldMap.discount]
                    );
                    this.renderer.$el
                        .find(".oe_price")
                        .html(
                            tools.monetary(
                                price_reduce,
                                this.getParent().state.fields[this.fieldMap.price_unit],
                                this.currencyField,
                                values
                            )
                        );
                },
            }
        );

        const ProductPickerQuickModifPriceFormView = QuickCreateFormView.extend({
            config: _.extend({}, QuickCreateFormView.prototype.config, {
                Renderer: ProductPickerQuickModifPriceFormRenderer,
                Controller: ProductPickerQuickModifPriceFormController,
            }),

            init: function(viewInfo, params) {
                this._super.apply(this, arguments);
                this.controllerParams.fieldMap = params.fieldMap;
                this.controllerParams.context = params.context;
                this.controllerParams.parentRecordData = params.parentRecordData;
                this.controllerParams.currencyField = params.currencyField;
            },
        });

        return {
            ProductPickerQuickModifPriceFormRenderer: ProductPickerQuickModifPriceFormRenderer,
            ProductPickerQuickModifPriceFormController: ProductPickerQuickModifPriceFormController,
            ProductPickerQuickModifPriceFormView: ProductPickerQuickModifPriceFormView,
        };
    }
);

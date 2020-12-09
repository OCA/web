// Copyright 2020 Tecnativa - Alexandre Díaz
// License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).
odoo.define("web_widget_one2many_product_picker.ProductPickerQuickModifPriceFormView", function (
    require
) {
    "use strict";

    /**
     * This file defines the QuickCreateFormView, an extension of the FormView that
     * is used by the RecordQuickCreate in One2ManyProductPicker views.
     */

    var QuickCreateFormView = require("web.QuickCreateFormView");
    var core = require("web.core");
    var tools = require("web_widget_one2many_product_picker.tools");

    var qweb = core.qweb;

    var ProductPickerQuickModifPriceFormRenderer =
        QuickCreateFormView.prototype.config.Renderer.extend(
            {
                /**
                 * @override
                 */
                start: function () {
                    var self = this;
                    this.$el.addClass(
                        "oe_one2many_product_picker_form_view o_xxs_form_view");
                    return this._super.apply(this, arguments).then(function () {
                        self._appendPrice();
                        self._appendButtons();
                    });
                },

                /**
                 * @private
                 */
                _appendButtons: function () {
                    this.$el.find(
                        ".oe_one2many_product_picker_form_buttons").remove();
                    this.$el.append(
                        qweb.render(
                            "One2ManyProductPicker.QuickModifPrice.FormButtons", {
                                mode: this.mode,
                            })
                        );
                },

                /**
                 * @private
                 */
                _appendPrice: function () {
                    this.$el.find(".oe_price").remove();
                    this.$el.append(
                        qweb.render("One2ManyProductPicker.QuickModifPrice.Price")
                    );
                },
            }
        );

    var ProductPickerQuickModifPriceFormController =
        QuickCreateFormView.prototype.config.Controller.extend(
            {
                events: _.extend({}, QuickCreateFormView.prototype.events, {
                    "click .oe_record_change": "_onClickChange",
                    "click .oe_record_discard": "_onClickDiscard",
                }),

                /**
                 * @override
                 */
                init: function (parent, model, renderer, params) {
                    this.fieldMap = params.fieldMap;
                    this.context = params.context;
                    this._super.apply(this, arguments);
                    this.currencyField = params.currencyField;
                    this.parentRecordData = params.parentRecordData;
                },

                /**
                 * @override
                 */
                start: function () {
                    var self = this;
                    return this._super.apply(this, arguments).then(function () {
                        self._updatePrice();
                    });
                },

                /**
                 * @override
                 */
                _onFieldChanged: function () {
                    this._super.apply(this, arguments);
                    this._updatePrice();
                },

                /**
                 * @private
                 */
                _updatePrice: function () {
                    var record = this.model.get(this.handle);
                    var price_reduce = tools.priceReduce(
                        record.data[this.fieldMap.price_unit],
                        record.data[this.fieldMap.discount]);
                    this.renderer.$el.find(".oe_price").html(
                        tools.monetary(
                            price_reduce,
                            this.getParent().state.fields[this.fieldMap.price_unit],
                            this.currencyField,
                            record
                        )
                    );
                },

                /**
                 * @private
                 */
                _disableQuickCreate: function () {

                    // Ensures that the record won't be created twice
                    this._disabled = true;
                    this.$el.addClass("o_disabled");
                    this.$("input:not(:disabled)")
                        .addClass("o_temporarily_disabled")
                        .attr("disabled", "disabled");
                },

                /**
                 * @private
                 */
                _enableQuickCreate: function () {

                    // Allows to create again
                    this._disabled = false;
                    this.$el.removeClass("o_disabled");
                    this.$("input.o_temporarily_disabled")
                        .removeClass("o_temporarily_disabled")
                        .attr("disabled", false);
                },

                /**
                 * @private
                 * @param {MouseEvent} ev
                 */
                _onClickChange: function (ev) {
                    var self = this;
                    ev.stopPropagation();
                    this.model.updateRecordContext(this.handle, {
                        has_changes_confirmed: true,
                    });
                    var is_virtual = this.model.isPureVirtual(this.handle);

                    // If is a 'pure virtual' record, save it in the selected list
                    if (is_virtual) {
                        if (this.model.isDirty(this.handle)) {
                            this._disableQuickCreate();
                            this.saveRecord(this.handle, {
                                stayInEdit: true,
                                reload: true,
                                savePoint: true,
                                viewType: "form",
                            }).then(function () {
                                self._enableQuickCreate();
                                var record = self.model.get(self.handle);
                                self.model.unsetDirty(self.handle);
                                self.trigger_up("create_quick_record", {
                                    id: record.id,
                                });
                                self.getParent().destroy();
                            });
                        } else {
                            this.getParent().destroy();
                        }
                    } else {

                        // If is a "normal" record, update it
                        var record = this.model.get(this.handle);
                        this.trigger_up("update_quick_record", {
                            id: record.id,
                        });
                        this.getParent().destroy();
                    }
                },

                /**
                 * @private
                 * @param {MouseEvent} ev
                 */
                _onClickDiscard: function (ev) {
                    ev.stopPropagation();
                    this.model.discardChanges(this.handle, {
                        rollback: true,
                    });
                    var record = this.model.get(this.handle);
                    this.trigger_up("update_quick_record", {
                        id: record.id,
                    });
                    this.getParent().destroy();
                },
            }
        );

    var ProductPickerQuickModifPriceFormView = QuickCreateFormView.extend({
        config: _.extend({}, QuickCreateFormView.prototype.config, {
            Renderer: ProductPickerQuickModifPriceFormRenderer,
            Controller: ProductPickerQuickModifPriceFormController,
        }),

        init: function (viewInfo, params) {
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
});

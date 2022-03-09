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

        var QuickCreateFormView = require("web.QuickCreateFormView");
        var core = require("web.core");
        var tools = require("web_widget_one2many_product_picker.tools");

        var qweb = core.qweb;

        var ProductPickerQuickModifPriceFormRenderer = QuickCreateFormView.prototype.config.Renderer.extend(
            {
                /**
                 * @override
                 */
                start: function() {
                    var self = this;
                    this.$el.addClass(
                        "oe_one2many_product_picker_form_view o_xxs_form_view"
                    );
                    return this._super.apply(this, arguments).then(function() {
                        self._appendPrice();
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

        var ProductPickerQuickModifPriceFormController = QuickCreateFormView.prototype.config.Controller.extend(
            {
                /**
                 * @override
                 */
                init: function(parent, model, renderer, params) {
                    this.fieldMap = params.fieldMap;
                    this.context = params.context;
                    this.currencyField = params.currencyField;
                    this.parentRecordData = params.parentRecordData;
                    this.fields = parent.state.fields;
                    this._super.apply(this, arguments);
                },

                /**
                 * @override
                 */
                start: function() {
                    var self = this;
                    return this._super.apply(this, arguments).then(function() {
                        var record = self.model.get(self.handle);
                        self._updatePrice(record.data);
                    });
                },

                /**
                 * @override
                 */
                _onFieldChanged: function(ev) {
                    this._super.apply(this, arguments);
                    if (!_.isEmpty(ev.data.changes)) {
                        this.model.updateRecordContext(this.handle, {
                            has_changes_unconfirmed: true,
                        });
                    }
                },

                /**
                 * @override
                 */
                _applyChanges: function() {
                    return this._super.apply(this, arguments).then(() => {
                        var record = this.model.get(this.handle);
                        this._updatePrice(record.data);
                    });
                },

                /**
                 * @private
                 * @param {Object} values
                 */
                _updatePrice: function(values) {
                    var price_reduce = tools.priceReduce(
                        values[this.fieldMap.price_unit],
                        values[this.fieldMap.discount]
                    );
                    this.renderer.$el
                        .find(".oe_price")
                        .html(
                            tools.monetary(
                                price_reduce,
                                this.fields[this.fieldMap.price_unit],
                                this.currencyField,
                                values
                            )
                        );
                },

                /**
                 * @private
                 * @param {MouseEvent} ev
                 */
                _onClickChange: function(ev) {
                    var self = this;
                    var def = $.Deferred();
                    ev.stopPropagation();
                    this.model.updateRecordContext(this.handle, {
                        has_changes_unconfirmed: false,
                    });

                    if (!this.model.isDirty(this.handle)) {
                        return def.resolve();
                    }

                    this._disableQuickCreate();
                    this.trigger_up("quick_record_updated", {
                        changes: _.extend(
                            {},
                            this.model.localData[this.handle].data,
                            this.model.localData[this.handle]._changes
                        ),
                        highlight: {price: true},
                    });

                    this.model.updateRecordContext(this.handle, {
                        need_notify: true,
                        modified: true,
                    });
                    this.trigger_up("block_card", {status: true});
                    this.trigger_up("modify_quick_record", {
                        id: this.handle,
                    });

                    var is_virtual = this.model.isPureVirtual(this.handle);
                    // If is a 'pure virtual' record, save it in the selected list
                    if (is_virtual) {
                        this.saveRecord(this.handle, {
                            stayInEdit: true,
                            reload: true,
                            savePoint: true,
                            viewType: "form",
                        }).then(function() {
                            def.resolve(true);
                            self.trigger_up("create_quick_record", {
                                id: self.handle,
                                on_onchange: function() {
                                    self.trigger_up("block_card", {status: false});
                                    self._enableQuickCreate();
                                },
                            });
                        });
                    } else {
                        def.resolve(true);
                        // If is a "normal" record, update it
                        this.trigger_up("update_quick_record", {
                            id: this.handle,
                            on_onchange: function() {
                                self.trigger_up("block_card", {status: false});
                                self._enableQuickCreate();
                            },
                        });
                    }
                    return def;
                },

                /**
                 * @private
                 * @param {MouseEvent} ev
                 */
                _onClickDiscard: function(ev) {
                    var self = this;
                    ev.stopPropagation();
                    if (!this.model.isDirty(this.handle)) {
                        return true;
                    }
                    this.model.discardChanges(this.handle, {
                        rollback: true,
                    });
                    this.model.updateRecordContext(this.handle, {
                        need_notify: false,
                        modified: false,
                    });
                    this.trigger_up("block_card", {status: true});
                    this.trigger_up("modify_quick_record", {
                        id: this.handle,
                    });
                    this.trigger_up("update_quick_record", {
                        id: this.handle,
                        on_onchange: function() {
                            self.trigger_up("block_card", {status: false});
                            self._enableQuickCreate();
                        },
                    });
                    return true;
                },

                /**
                 * @private
                 */
                _disableQuickCreate: function() {
                    // Ensures that the record won't be created twice
                    this.$el.addClass("o_disabled");
                    this.$("input:not(:disabled),button:not(:disabled)")
                        .addClass("o_temporarily_disabled")
                        .attr("disabled", "disabled");
                },

                /**
                 * @private
                 */
                _enableQuickCreate: function() {
                    // Allows to create again
                    this.$el.removeClass("o_disabled");
                    this.$("input.o_temporarily_disabled,button.o_temporarily_disabled")
                        .removeClass("o_temporarily_disabled")
                        .attr("disabled", false);
                },
            }
        );

        var ProductPickerQuickModifPriceFormView = QuickCreateFormView.extend({
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

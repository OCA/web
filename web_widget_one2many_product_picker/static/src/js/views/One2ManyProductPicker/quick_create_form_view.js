// Copyright 2020 Tecnativa - Alexandre Díaz
// License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).
odoo.define("web_widget_one2many_product_picker.ProductPickerQuickCreateFormView", function (
    require
) {
    "use strict";

    /**
     * This file defines the QuickCreateFormView, an extension of the FormView that
     * is used by the RecordQuickCreate in One2ManyProductPicker views.
     */

    var QuickCreateFormView = require("web.QuickCreateFormView");
    var BasicModel = require("web.BasicModel");
    var core = require("web.core");

    var qweb = core.qweb;

    BasicModel.include({
        _applyOnChange: function (values, record, viewType) {
            var vt = viewType || record.viewType;
            // Ignore changes by record context 'ignore_onchanges' fields
            if ('ignore_onchanges' in record.context) {
                var ignore_changes = record.context.ignore_onchanges;
                for (var index in ignore_changes) {
                    var field_name = ignore_changes[index];
                    delete values[field_name];
                }
                delete record.context.ignore_onchanges;
            }
            return this._super(values, record, viewType);
        },
    });

    var ProductPickerQuickCreateFormRenderer =
        QuickCreateFormView.prototype.config.Renderer.extend(
            {

                /**
                 * @override
                 */
                start: function () {
                    this.$el.addClass(
                        "oe_one2many_product_picker_form_view o_xxs_form_view");
                    return this._super.apply(this, arguments);
                },
            }
        );

    var ProductPickerQuickCreateFormController =
        QuickCreateFormView.prototype.config.Controller.extend(
            {
                events: _.extend({}, QuickCreateFormView.prototype.events, {
                    "click .oe_record_add": "_onClickAdd",
                    "click .oe_record_remove": "_onClickRemove",
                    "click .oe_record_change": "_onClickChange",
                    "click .oe_record_discard": "_onClickDiscard",
                }),

                init: function (parent, model, renderer, params) {
                    this.compareKey = params.compareKey;
                    this.fieldMap = params.fieldMap;
                    this.context = params.context;
                    this.mainRecordData = params.mainRecordData;
                    this._super.apply(this, arguments);
                },

                /**
                 * Create or accept changes
                 */
                auto: function () {
                    var record = this.model.get(this.handle);
                    if (record.context.has_changes_confirmed || typeof record.context.has_changes_confirmed === "undefined") {
                        return;
                    }
                    var state = this._getRecordState();
                    if (state === "new") {
                        this._add();
                    } else if (state === "dirty") {
                        this._change();
                    }
                },

                /**
                 * Know the real state of the record
                 *  - record: Normal
                 *  - new: Is a new record
                 *  - dirty: Has changes
                 */
                _getRecordState: function () {
                    var record = this.model.get(this.handle);
                    var state = "record";
                    if (this.model.isNew(record.id)) {
                        state = "new";
                    } else if (record.isDirty()) {
                        state = "dirty";
                    }
                    if (state === "new") {
                        for (var index in this.mainRecordData.data) {
                            var recordData = this.mainRecordData.data[index];
                            if (recordData.ref === record.ref) {
                                if (record.isDirty()) {
                                    state = "dirty";
                                } else {
                                    state = "record";
                                }
                                break;
                            }
                        }
                    }

                    return state;
                },

                /**
                 * Updates buttons depending on record status
                 *
                 * @private
                 */
                _updateButtons: function () {
                    this.$el.find(
                        ".oe_one2many_product_picker_form_buttons").remove();
                    this.$el.find(".o_form_view").append(
                        qweb.render(
                            "One2ManyProductPicker.QuickCreate.FormButtons", {
                                state: this._getRecordState(),
                            })
                        );

                    if (this._disabled) {
                        this._disableQuickCreate();
                    }
                },

                /**
                 * @private
                 */
                _disableQuickCreate: function () {
                    if (!this.$el) {
                        return;
                    }
                    // Ensures that the record won't be created twice
                    this._disabled = true;
                    this.$el.addClass("o_disabled");
                    this.$("input:not(:disabled),button:not(:disabled)")
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
                    this.$("input.o_temporarily_disabled,button.o_temporarily_disabled")
                        .removeClass("o_temporarily_disabled")
                        .attr("disabled", false);
                },

                /**
                 * @private
                 * @param {Array[String]} fields_changed
                 * @returns {Boolean}
                 */
                _needReloadCard: function (fields_changed) {
                    for (var index in fields_changed) {
                        var field = fields_changed[index];
                        if (field === this.fieldMap[this.compareKey]) {
                            return true;
                        }
                    }
                    return false;
                },

                /**
                 * Handle "compare field" changes. This field is used
                 * as master to know if we are editing or creating a
                 * new record.
                 *
                 * @private
                 * @param {ChangeEvent} ev
                 */
                _onFieldChanged: function (ev) {
                    var fields_changed = Object.keys(ev.data.changes);
                    if (this._needReloadCard(fields_changed)) {
                        var field = ev.data.changes[fields_changed[0]];
                        var new_value = false;
                        if (typeof field === "object") {
                            new_value = field.id;
                        } else {
                            new_value = field;
                        }
                        var reload_values = {
                            compareValue: new_value,
                        };
                        var record = this.model.get(this.handle);
                        if (!('base_record_id' in record.context)) {
                            var old_value = record.data[this.compareKey];
                            if (typeof old_value === 'object') {
                                old_value = old_value.data.id;
                            }
                            reload_values.baseRecordID = record.id;
                            reload_values.baseRecordResID = record.ref;
                            reload_values.baseRecordCompareValue = old_value;
                        } else {
                            reload_values.baseRecordID =
                                record.context.base_record_id;
                            reload_values.baseRecordResID =
                                record.context.base_record_res_id;
                            reload_values.baseRecordCompareValue =
                                record.context.base_record_compare_value;
                        }
                        this.trigger_up("reload_view", reload_values);

                        // Discard current change
                        ev.data.changes = {};
                    } else {
                        this._super.apply(this, arguments);
                        if (!_.isEmpty(ev.data.changes)) {
                            if (this.model.isPureVirtual(this.handle)) {
                                this.model.unsetDirty(this.handle);
                            }
                            this.model.updateRecordContext(this.handle, {
                                has_changes_confirmed: false,
                            });
                            this.trigger_up("quick_record_updated", {
                                changes: ev.data.changes,
                            });
                            this._updateButtons();
                        }
                    }
                },

                /**
                 * @returns {Deferred}
                 */
                _add: function () {
                    if (this._disabled) {

                        // Don't do anything if we are already creating a record
                        return $.Deferred();
                    }
                    this.model.updateRecordContext(this.handle, {
                        has_changes_confirmed: true,
                    });
                    var self = this;
                    this._disableQuickCreate();
                    return this.saveRecord(this.handle, {
                        stayInEdit: true,
                        reload: true,
                        savePoint: true,
                        viewType: "form",
                    }).then(function () {
                        var record = self.model.get(self.handle);
                        self.model.updateRecordContext(self.handle, {saving: true});
                        self.trigger_up("restore_flip_card", {
                            success_callback: function () {
                                self.trigger_up("create_quick_record", {
                                    id: record.id,
                                    callback: function () {
                                        self.model.unsetDirty(self.handle);
                                        self._enableQuickCreate();
                                    },
                                });
                            },
                            block: true,
                        });
                    });
                },

                _remove: function () {
                    if (this._disabled) {
                        return $.Deferred();
                    }

                    this._disableQuickCreate();
                    this.trigger_up("restore_flip_card", {block: true});
                    var record = this.model.get(this.handle);
                    this.trigger_up("list_record_remove", {
                        id: record.id,
                    });
                },

                _change: function () {
                    var self = this;
                    if (this._disabled) {

                        // Don't do anything if we are already creating a record
                        return $.Deferred();
                    }
                    this._disableQuickCreate();
                    this.model.updateRecordContext(this.handle, {
                        has_changes_confirmed: true,
                    });
                    var record = this.model.get(this.handle);

                    this.trigger_up("restore_flip_card", {
                        success_callback: function () {
                            self.trigger_up("update_quick_record", {
                                id: record.id,
                                callback: function () {
                                    self.model.unsetDirty(self.handle);
                                    self._enableQuickCreate();
                                }
                            });
                        },
                        block: true,
                    });
                },

                _discard: function () {
                    var self = this;
                    if (this._disabled) {

                        // Don't do anything if we are already creating a record
                        return $.Deferred();
                    }
                    this._disableQuickCreate();
                    var record = this.model.get(this.handle);
                    this.model.discardChanges(this.handle, {
                        rollback: true,
                    });
                    this.trigger_up("quick_record_updated", {
                        changes: record.data,
                    });
                    if (this.model.isNew(record.id)) {
                        this.update({}, {reload: false});
                        this.trigger_up("restore_flip_card");
                        this._updateButtons();
                        this._enableQuickCreate();
                    } else {
                        this.update({}, {reload: false}).then(function () {
                            self.model.unsetDirty(self.handle);
                            self.trigger_up("restore_flip_card");
                            self._updateButtons();
                            self._enableQuickCreate();
                        });
                    }
                },

                /**
                 * @private
                 * @param {MouseEvent} ev
                 */
                _onClickAdd: function (ev) {
                    ev.stopPropagation();
                    this._add();
                },

                /**
                 * @private
                 * @param {MouseEvent} ev
                 */
                _onClickRemove: function (ev) {
                    ev.stopPropagation();
                    this._remove();
                },

                /**
                 * @private
                 * @param {MouseEvent} ev
                 */
                _onClickChange: function (ev) {
                    ev.stopPropagation();
                    this._change();
                },

                /**
                 * @private
                 * @param {MouseEvent} ev
                 */
                _onClickDiscard: function (ev) {
                    ev.stopPropagation();
                    this._discard();
                },
            }
        );

    var ProductPickerQuickCreateFormView = QuickCreateFormView.extend({
        config: _.extend({}, QuickCreateFormView.prototype.config, {
            Renderer: ProductPickerQuickCreateFormRenderer,
            Controller: ProductPickerQuickCreateFormController,
        }),

        /**
         * @override
         */
        init: function (viewInfo, params) {
            this._super.apply(this, arguments);
            this.controllerParams.compareKey = params.compareKey;
            this.controllerParams.fieldMap = params.fieldMap;
            this.controllerParams.context = params.context;
            this.controllerParams.mainRecordData = params.mainRecordData;
        },
    });

    return {
        ProductPickerQuickCreateFormRenderer: ProductPickerQuickCreateFormRenderer,
        ProductPickerQuickCreateFormController: ProductPickerQuickCreateFormController,
        ProductPickerQuickCreateFormView: ProductPickerQuickCreateFormView,
    };
});

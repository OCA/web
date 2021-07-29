// Copyright 2020 Tecnativa - Alexandre Díaz
// License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).
odoo.define(
    "web_widget_one2many_product_picker.ProductPickerQuickModifPriceForm",
    function(require) {
        "use strict";

        const core = require("web.core");
        const Widget = require("web.Widget");
        const ProductPickerQuickModifPriceFormView = require("web_widget_one2many_product_picker.ProductPickerQuickModifPriceFormView")
            .ProductPickerQuickModifPriceFormView;

        const qweb = core.qweb;

        /**
         * This widget render a Form. Used by FieldOne2ManyProductPicker
         */
        const ProductPickerQuickModifPriceForm = Widget.extend({
            className: "oe_one2many_product_picker_quick_modif_price",
            xmlDependencies: [
                "/web_widget_one2many_product_picker/static/src/xml/one2many_product_picker_quick_modif_price.xml",
            ],
            events: {
                "click .oe_record_change": "_onClickChange",
                "click .oe_record_discard": "_onClickDiscard",
            },

            /**
             * @override
             */
            init: function(parent, options) {
                this._super.apply(this, arguments);
                this.state = options.state;
                this.main_state = options.main_state;
                this.node = options.node;
                this.fields = options.fields;
                this.fieldMap = options.fieldMap;
                this.searchRecord = options.searchRecord;
                this.fieldsInfo = options.fieldsInfo;
                this.readonly = options.readonly;
                this.basicFieldParams = options.basicFieldParams;
                this.canEditPrice = options.canEditPrice;
                this.canEditDiscount = options.canEditDiscount;
                this.currencyField = options.currencyField;
                this.res_id = this.state && this.state.res_id;
                this.id = this.state && this.state.id;
                this.editContext = {};
            },

            /**
             * @override
             */
            start: function() {
                const def1 = this._super.apply(this, arguments);
                const fieldsView = {
                    arch: this._generateFormArch(),
                    fields: this.fields,
                    viewFields: this.fields,
                    base_model: this.basicFieldParams.field.relation,
                    type: "form",
                    model: this.basicFieldParams.field.relation,
                };
                this.formView = new ProductPickerQuickModifPriceFormView(fieldsView, {
                    context: this.main_state.getContext(),
                    fieldMap: this.fieldMap,
                    modelName: this.basicFieldParams.field.relation,
                    userContext: this.getSession().user_context,
                    ids: this.res_id ? [this.res_id] : [],
                    currentId: this.res_id || undefined,
                    mode: this.res_id && this.readonly ? "readonly" : "edit",
                    recordID: this.id,
                    index: 0,
                    parentID: this.basicFieldParams.parentID,
                    default_buttons: true,
                    withControlPanel: false,
                    model: this.basicFieldParams.model,
                    parentRecordData: this.basicFieldParams.recordData,
                    currencyField: this.currencyField,
                    disable_autofocus: true,
                });
                if (this.id) {
                    this.basicFieldParams.model.save(this.id, {savePoint: true});
                }
                const def2 = this.formView.getController(this).then(controller => {
                    this.controller = controller;
                    this.$(".modal-body").empty();
                    this.controller.appendTo(this.$(".modal-body"));
                    this.$el.on("hidden.bs.modal", this._onModalHidden.bind(this));
                });

                return Promise.all([def1, def2]);
            },

            /**
             * @override
             */
            destroy: function() {
                this.$el.off("hidden.bs.modal");
                this._super.apply(this, arguments);
            },

            on_attach_callback: function() {
                // Do nothing
            },

            /**
             * @private
             * @returns {String}
             */
            _generateFormArch: function() {
                const wanted_field_states = this._getWantedFieldState();
                let template =
                    "<templates><t t-name='One2ManyProductPicker.QuickModifPrice.Form'>";
                template += this.basicFieldParams.field.views.form.arch;
                template += "</t></templates>";
                qweb.add_template(template);
                const $arch = $(
                    qweb.render("One2ManyProductPicker.QuickModifPrice.Form", {
                        field_map: this.fieldMap,
                        record_search: this.searchRecord,
                    })
                );

                const field_names = Object.keys(
                    this.basicFieldParams.field.views.form.fields
                );
                let gen_arch = "<form><group>";
                for (const index in field_names) {
                    const field_name = field_names[index];
                    const $field = $arch.find("field[name='" + field_name + "']");
                    const modifiers = $field.attr("modifiers")
                        ? JSON.parse($field.attr("modifiers"))
                        : {};
                    modifiers.invisible = !(field_name in wanted_field_states);
                    modifiers.readonly = wanted_field_states[field_name];
                    $field.attr("modifiers", JSON.stringify(modifiers));
                    $field.attr("invisible", modifiers.invisible ? "1" : "0");
                    $field.attr(
                        "readonly",
                        wanted_field_states[field_name] ? "1" : "0"
                    );
                    if (
                        [this.fieldMap.price_unit, this.fieldMap.product].indexOf(
                            field_name
                        ) !== -1
                    ) {
                        $field.attr("force_save", "1");
                    }
                    gen_arch += $field[0].outerHTML;
                }
                gen_arch += "</group></form>";
                return gen_arch;
            },

            /**
             * This method returns the wanted fields to be displayed in the view.
             * {field_name: readonly_state}
             *
             * @private
             * @returns {Object}
             */
            _getWantedFieldState: function() {
                const wantedFieldState = {};
                wantedFieldState[this.fieldMap.discount] = !this.canEditDiscount;
                wantedFieldState[this.fieldMap.price_unit] = !this.canEditPrice;
                return wantedFieldState;
            },

            /**
             * @private
             */
            _onModalHidden: function() {
                this.destroy();
            },

            /**
             * @private
             * @param {MouseEvent} ev
             */
            _onClickChange: function(ev) {
                ev.stopPropagation();
                const model = this.basicFieldParams.model;
                model.updateRecordContext(this.id, {
                    has_changes_confirmed: true,
                });
                const is_virtual = model.isPureVirtual(this.id);

                // If is a 'pure virtual' record, save it in the selected list
                if (is_virtual) {
                    if (model.isDirty(this.id)) {
                        this._disableQuickCreate();
                        this.controller
                            .saveRecord(this.id, {
                                stayInEdit: true,
                                reload: true,
                                savePoint: true,
                                viewType: "form",
                            })
                            .then(() => {
                                this._enableQuickCreate();
                                model.unsetDirty(this.id);
                                this.trigger_up("create_quick_record", {
                                    id: this.id,
                                });
                            });
                    }
                } else {
                    // If is a "normal" record, update it
                    this.trigger_up("update_quick_record", {
                        id: this.id,
                    });
                    model.unsetDirty(this.id);
                }
            },

            /**
             * @private
             * @param {MouseEvent} ev
             */
            _onClickDiscard: function(ev) {
                ev.stopPropagation();
                const model = this.basicFieldParams.model;
                model.discardChanges(this.id, {
                    rollback: true,
                });
                this.trigger_up("update_quick_record", {
                    id: this.id,
                });
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
        });

        return ProductPickerQuickModifPriceForm;
    }
);

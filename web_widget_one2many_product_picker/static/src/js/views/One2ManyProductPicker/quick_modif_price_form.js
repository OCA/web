/* global py */
// Copyright 2020 Tecnativa - Alexandre Díaz
// License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).
odoo.define(
    "web_widget_one2many_product_picker.ProductPickerQuickModifPriceForm",
    function(require) {
        "use strict";

        var core = require("web.core");
        var Widget = require("web.Widget");
        var widgetRegistry = require("web.widget_registry");
        var ProductPickerQuickModifPriceFormView = require("web_widget_one2many_product_picker.ProductPickerQuickModifPriceFormView")
            .ProductPickerQuickModifPriceFormView;

        var qweb = core.qweb;

        /**
         * This widget render a Form. Used by FieldOne2ManyProductPicker
         */
        var ProductPickerQuickModifPriceForm = Widget.extend({
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
                this.trigger_up("pause_auto_save");
                this.state = options.state;
                this.main_state = options.main_state;
                this.node = options.node;
                this.fields = options.fields;
                this.fieldMap = options.fieldMap;
                this.searchRecord = options.searchRecord;
                this.fieldsInfo = _.extend({}, options.fieldsInfo);
                this.readonly = options.readonly;
                this.basicFieldParams = options.basicFieldParams;
                this.canEditPrice = options.canEditPrice;
                this.canEditDiscount = options.canEditDiscount;
                this.currencyField = options.currencyField;
                this.res_id = this.state && this.state.res_id;
                this.id = this.state && this.state.id;
                this.editContext = {};
                this._fieldsInvisible = [];
            },

            /**
             * @override
             */
            start: function() {
                var self = this;
                this._super.apply(this, arguments).then(function() {
                    var fieldsView = {
                        arch: self._generateFormArch(),
                        fields: self.fields,
                        viewFields: self.fields,
                        base_model: self.basicFieldParams.field.relation,
                        type: "form",
                        model: self.basicFieldParams.field.relation,
                    };

                    var node_context = self.node.attr("context") || "{}";
                    self.nodeContext = py.eval(node_context, {
                        active_id: self.res_id || false,
                    });
                    var refinedContext = _.extend(
                        {},
                        self.main_state.getContext(),
                        self.nodeContext
                    );
                    _.extend(refinedContext, self.editContext);

                    self.formView = new ProductPickerQuickModifPriceFormView(
                        fieldsView,
                        {
                            context: refinedContext,
                            fieldMap: self.fieldMap,
                            modelName: self.basicFieldParams.field.relation,
                            userContext: self.getSession().user_context,
                            ids: self.res_id ? [self.res_id] : [],
                            currentId: self.res_id || undefined,
                            mode: self.res_id && self.readonly ? "readonly" : "edit",
                            recordID: self.id,
                            index: 0,
                            parentID: self.basicFieldParams.parentID,
                            default_buttons: true,
                            withControlPanel: false,
                            model: self.basicFieldParams.model,
                            parentRecordData: self.getParent().getParent().state,
                            currencyField: self.currencyField,
                            disable_autofocus: true,
                        }
                    );
                    if (self.id) {
                        self.basicFieldParams.model.save(self.id, {savePoint: true});
                    }
                    return self.formView.getController(self).then(function(controller) {
                        self.controller = controller;
                        self.$(".modal-body").empty();
                        self.controller.appendTo(self.$(".modal-body"));
                        self.$el.on("hidden.bs.modal", self._onModalHidden.bind(self));
                        self.$el.find('.oe_record_change').removeClass('d-none');
                        return controller;
                    });
                });
            },

            /**
             * @override
             */
            destroy: function() {
                this._restoreNoFetch();
                this.trigger_up("resume_auto_save");
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
                var wanted_field_states = this._getWantedFieldState();
                var template =
                    "<templates><t t-name='One2ManyProductPicker.QuickModifPrice.Form'>";
                template += this.basicFieldParams.field.views.form.arch;
                template += "</t></templates>";
                qweb.add_template(template);
                var $arch = $(
                    qweb.render("One2ManyProductPicker.QuickModifPrice.Form", {
                        field_map: this.fieldMap,
                        record_search: this.searchRecord,
                    })
                );

                var field_names = Object.keys(
                    this.basicFieldParams.field.views.form.fields
                );
                var gen_arch = "<form><group>";
                for (var index in field_names) {
                    var field_name = field_names[index];
                    var $field = $arch.find("field[name='" + field_name + "']");
                    var modifiers = $field.attr("modifiers")
                        ? JSON.parse($field.attr("modifiers"))
                        : {};
                    if (!modifiers.invisible && !(field_name in wanted_field_states)) {
                        this._fieldsInvisible.push(field_name);
                    }
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
                var wantedFieldState = {};
                wantedFieldState[this.fieldMap.discount] = !this.canEditDiscount;
                wantedFieldState[this.fieldMap.price_unit] = !this.canEditPrice;
                return wantedFieldState;
            },

            /**
             * @private
             */
            _onClickDiscard: function(ev) {
                if (this.controller) {
                    this._hideControlButtons(true);
                    this.controller._onClickDiscard(ev);
                }
            },

            /**
             * @private
             */
            _onClickChange: function(ev) {
                var self = this;
                if (!this.controller) {
                    return;
                }
                self._hideControlButtons(true);
                this.controller._onClickChange(ev).then(function(res) {
                    if (res) {
                        self.$el.modal("hide");
                    } else {
                        self._hideControlButtons(false);
                    }
                });
            },

            /**
             * @private
             */
            _onModalHidden: function() {
                this.destroy();
            },

            _hideControlButtons: function(status) {
                this.$el.find('.oe_record_change').toggleClass('d-none', status);
                this.$el.find('.oe_record_discard').toggleClass('d-none', status);
            },

            /**
             * @private
             */
            _restoreNoFetch: function() {
                var record = this.basicFieldParams.model.get(this.id);
                for (var field_name of this._fieldsInvisible) {
                    record.fieldsInfo[record.viewType][field_name].__no_fetch = false;
                }
                this._fieldsInvisible = [];
            },
        });

        widgetRegistry.add(
            "product_picker_quick_modif_price_form",
            ProductPickerQuickModifPriceForm
        );

        return ProductPickerQuickModifPriceForm;
    }
);

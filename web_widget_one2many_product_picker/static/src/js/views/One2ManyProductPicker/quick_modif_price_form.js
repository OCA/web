// Copyright 2020 Tecnativa - Alexandre Díaz
// License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).
odoo.define("web_widget_one2many_product_picker.ProductPickerQuickModifPriceForm", function (
    require
) {
    "use strict";

    var core = require("web.core");
    var Widget = require("web.Widget");
    var ProductPickerQuickModifPriceFormView = require(
        "web_widget_one2many_product_picker.ProductPickerQuickModifPriceFormView"
    ).ProductPickerQuickModifPriceFormView;

    var qweb = core.qweb;

    /**
     * This widget render a Form. Used by FieldOne2ManyProductPicker
     */
    var ProductPickerQuickModifPriceForm = Widget.extend({
        className: "oe_one2many_product_picker_quick_modif_price",
        xmlDependencies: [
            "/web_widget_one2many_product_picker/static/src/xml/one2many_product_picker_quick_modif_price.xml",
        ],

        /**
         * @override
         */
        init: function (parent, options) {
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
        start: function () {
            var self = this;
            var def1 = this._super.apply(this, arguments);
            var fieldsView = {
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
            var def2 = this.formView.getController(this).then(function (controller) {
                self.controller = controller;
                self.$el.empty();
                self.controller.appendTo(self.$el);
            });

            return $.when(def1, def2);
        },

        /**
         * @override
         */
        destroy: function () {
            this._super.apply(this, arguments);
        },

        on_attach_callback: function () {
            // Do nothing
        },

        /**
         * @private
         * @returns {String}
         */
        _generateFormArch: function () {
            var wanted_field_states = this._getWantedFieldState();
            var template =
                "<templates><t t-name='One2ManyProductPicker.QuickModifPrice.Form'>";
            template += this.basicFieldParams.field.views.form.arch;
            template += "</t></templates>";
            qweb.add_template(template);
            var $arch = $(qweb.render("One2ManyProductPicker.QuickModifPrice.Form", {
                field_map: this.fieldMap,
                record_search: this.searchRecord,
            }));

            var field_names = Object.keys(wanted_field_states);
            var gen_arch = "<form><group>";
            for (var index in field_names) {
                var field_name = field_names[index];
                var $field = $arch.find("field[name='"+field_name+"']");
                var modifiers =
                    $field.attr("modifiers") ? JSON.parse($field.attr("modifiers")) : {};
                modifiers.invisible = false;
                modifiers.readonly = wanted_field_states[field_name];
                $field.attr("modifiers", JSON.stringify(modifiers));
                $field.attr("invisible", "0");
                $field.attr("readonly", wanted_field_states[field_name]?"1":"0");
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
        _getWantedFieldState: function () {
            var wantedFieldState = {};
            wantedFieldState[this.fieldMap.discount] = !this.canEditDiscount;
            wantedFieldState[this.fieldMap.price_unit] = !this.canEditPrice;
            return wantedFieldState;
        },
    });

    return ProductPickerQuickModifPriceForm;
});

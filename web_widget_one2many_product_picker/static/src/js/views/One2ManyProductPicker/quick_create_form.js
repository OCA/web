/* global py */
// Copyright 2020 Tecnativa - Alexandre Díaz
// License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).
odoo.define("web_widget_one2many_product_picker.ProductPickerQuickCreateForm", function(
    require
) {
    "use strict";

    const core = require("web.core");
    const Widget = require("web.Widget");
    const widgetRegistry = require("web.widget_registry");
    const ProductPickerQuickCreateFormView = require("web_widget_one2many_product_picker.ProductPickerQuickCreateFormView")
        .ProductPickerQuickCreateFormView;

    const qweb = core.qweb;

    /**
     * This widget render a Form. Used by FieldOne2ManyProductPicker
     */
    const ProductPickerQuickCreateForm = Widget.extend({
        className: "oe_one2many_product_picker_quick_create",
        xmlDependencies: [
            "/web_widget_one2many_product_picker/static/src/xml/one2many_product_picker_quick_create.xml",
        ],

        custom_events: {
            reload_view: "_onReloadView",
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
            this.compareKey = this.node.attr("compare-key") || false;
            this.res_id = this.state && this.state.res_id;
            this.id = this.state && this.state.id;
            this.editContext = {};
        },

        /**
         * @override
         */
        start: function() {
            const def1 = this._super.apply(this, arguments);
            const form_arch = this._generateFormArch();
            const fieldsView = {
                arch: form_arch,
                fields: this.fields,
                viewFields: this.fields,
                base_model: this.basicFieldParams.field.relation,
                type: "form",
                model: this.basicFieldParams.field.relation,
            };

            const node_context = this.node.attr("context") || "{}";
            this.nodeContext = py.eval(node_context, {
                active_id: this.res_id || false,
            });
            const refinedContext = _.extend(
                {},
                this.main_state.getContext(),
                this.nodeContext
            );
            _.extend(refinedContext, this.editContext);
            this.formView = new ProductPickerQuickCreateFormView(fieldsView, {
                context: refinedContext,
                compareKey: this.compareKey,
                fieldMap: this.fieldMap,
                modelName: this.basicFieldParams.field.relation,
                userContext: this.getSession().user_context,
                ids: this.res_id ? [this.res_id] : [],
                currentId: this.res_id || undefined,
                mode: this.res_id && this.readonly ? "readonly" : "edit",
                recordID: this.id,
                index: 0,
                parentID: this.basicFieldParams.parentID,
                default_buttons: false,
                withControlPanel: false,
                model: this.basicFieldParams.model,
                mainRecordData: this.getParent().getParent().state,
            });
            // If (this.id) {
            //     this.basicFieldParams.model.save(this.id, {savePoint: true});
            // }
            const def2 = this.formView.getController(this).then(controller => {
                this.controller = controller;
                this.$el.empty();
                this.controller.appendTo(this.$el);
            });

            return Promise.all([def1, def2]);
        },

        on_attach_callback: function() {
            if (this.controller) {
                this.controller.autofocus();
            }
        },

        /**
         * @private
         * @returns {String}
         */
        _generateFormArch: function() {
            let template =
                "<templates><t t-name='One2ManyProductPicker.QuickCreateForm'>";
            template += this.basicFieldParams.field.views.form.arch;
            template += "</t></templates>";
            qweb.add_template(template);
            return qweb.render("One2ManyProductPicker.QuickCreateForm", {
                field_map: this.fieldMap,
                record_search: this.searchRecord,
            });
        },

        /**
         * @private
         * @param {CustomEvent} evt
         */
        _onReloadView: function(evt) {
            this.editContext = {
                ignore_onchanges: [this.compareKey],
                base_record_id: evt.data.baseRecordID || null,
                base_record_res_id: evt.data.baseRecordResID || null,
                base_record_compare_value: evt.data.baseRecordCompareValue || null,
            };

            if (evt.data.baseRecordCompareValue === evt.data.compareValue) {
                this.res_id = evt.data.baseRecordResID;
                this.id = evt.data.baseRecordID;
                this.start();
            } else {
                this.getParent()
                    ._generateVirtualState({}, this.editContext)
                    .then(state => {
                        const data = {};
                        data[this.compareKey] = {
                            operation: "ADD",
                            id: evt.data.compareValue,
                        };
                        this.basicFieldParams.model
                            ._applyChange(state.id, data)
                            .then(() => {
                                this.res_id = state.res_id;
                                this.id = state.id;
                                this.start();
                            });
                    });
            }
        },
    });

    widgetRegistry.add(
        "product_picker_quick_create_form",
        ProductPickerQuickCreateForm
    );

    return ProductPickerQuickCreateForm;
});

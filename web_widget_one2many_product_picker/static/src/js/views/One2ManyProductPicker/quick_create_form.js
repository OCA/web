/* global py */
// Copyright 2020 Tecnativa - Alexandre Díaz
// License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).
odoo.define("web_widget_one2many_product_picker.ProductPickerQuickCreateForm", function(
    require
) {
    "use strict";

    var core = require("web.core");
    var Widget = require("web.Widget");
    var widgetRegistry = require("web.widget_registry");
    var ProductPickerQuickCreateFormView = require("web_widget_one2many_product_picker.ProductPickerQuickCreateFormView")
        .ProductPickerQuickCreateFormView;

    var qweb = core.qweb;

    /**
     * This widget render a Form. Used by FieldOne2ManyProductPicker
     */
    var ProductPickerQuickCreateForm = Widget.extend({
        className: "oe_one2many_product_picker_quick_create",
        xmlDependencies: [
            "/web_widget_one2many_product_picker/static/src/xml/one2many_product_picker_quick_create.xml",
        ],

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
            var self = this;
            return this._super.apply(this, arguments).then(function() {
                var form_arch = self._generateFormArch();
                var fieldsView = {
                    arch: form_arch,
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
                self.formView = new ProductPickerQuickCreateFormView(fieldsView, {
                    context: refinedContext,
                    compareKey: self.compareKey,
                    fieldMap: self.fieldMap,
                    modelName: self.basicFieldParams.field.relation,
                    userContext: self.getSession().user_context,
                    ids: self.res_id ? [self.res_id] : [],
                    currentId: self.res_id || undefined,
                    mode: self.res_id && self.readonly ? "readonly" : "edit",
                    recordID: self.id,
                    index: 0,
                    parentID: self.basicFieldParams.parentID,
                    default_buttons: false,
                    withControlPanel: false,
                    model: self.basicFieldParams.model,
                    mainRecordData: self.getParent().getParent().state,
                });
                return self.formView.getController(self).then(function(controller) {
                    self.controller = controller;
                    self.$el.empty();
                    self.controller.appendTo(self.$el);
                    self.trigger_up("back_form_loaded");
                    return controller;
                });
            });
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
            var template =
                "<templates><t t-name='One2ManyProductPicker.QuickCreateForm'>";
            template += this.basicFieldParams.field.views.form.arch;
            template += "</t></templates>";
            qweb.add_template(template);
            return qweb.render("One2ManyProductPicker.QuickCreateForm", {
                field_map: this.fieldMap,
                record_search: this.searchRecord,
            });
        },
    });

    widgetRegistry.add(
        "product_picker_quick_create_form",
        ProductPickerQuickCreateForm
    );

    return ProductPickerQuickCreateForm;
});

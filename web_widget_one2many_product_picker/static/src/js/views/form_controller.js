// Copyright 2021 Tecnativa - Alexandre Díaz
// License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).
odoo.define("web_widget_one2many_product_picker.FormController", function(require) {
    "use strict";

    var FormController = require("web.FormController");

    FormController.include({
        custom_events: _.extend({}, FormController.prototype.custom_events, {
            using_product_picker: '_onUsingProductPicker',
        }),

        /**
         * Disable product picker while saving
         *
         * @override
         */
        saveRecord: function() {
            var self = this;
            this.renderer.invokeProductPicker(this.handle, "onDocumentSave", true);
            return this._super.apply(this, arguments).always(function(changedFields) {
                self.renderer.invokeProductPicker(self.handle, "onDocumentSave", false);
                return changedFields;
            });
        },

        /**
         * This is necessary to refresh 'one2many_product_picker' when some 'trigger_refresh_fields' fields changes.
         *
         * @override
         */
        _confirmChange: function(id, fields, e) {
            var self = this;
            id = id || this.handle;
            return this._super.apply(this, arguments).then(function(resetWidgets) {
                if (self.renderer) {
                    self.renderer.invokeProductPicker(id, "onDocumentConfirmChanges", fields, e);
                }
                return resetWidgets;
            });
        },

        /**
         * @private
         * @param {CustomEvent} ev
         */
        _onUsingProductPicker: function(ev) {
            this.model.updateRecordContext(this.handle, {
                product_picker_field: ev.data.field,
                product_picker_product_field: ev.data.product_field,
                product_picker_relation: ev.data.relation,
                product_picker_relation_field: ev.data.relation_field,
            });
        }
    });
});

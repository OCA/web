odoo.define('web_form_orderedby.FormController', function (require) {
    'use strict';

    var FormController = require('web.FormController');
    FormController.include({

        /**
         * @override
         *
         * @param {boolean} params.hasSidebar
         * @param {Object} params.toolbarActions
         */
        init: function (parent, model, renderer, params) {
            this._super.apply(this, arguments);
            this.orderedBy = {};
        },

        /**
         * @override
         */
        update: function (params, options) {
            var self = this;
            return this._super(params, options).then(function () {
                self.restoreOrderedBy(self.orderedBy);
            });
        },

        /**
         * Browse all widgets to override the orderedBy attibute with the
         * one stored during _onToggleColumnOrder
         *
         * @param {dict} orderedBy
         */
        restoreOrderedBy: function (orderedBy) {
            var formKey = this.getFormKey();
            if (!(formKey in orderedBy )) {
                return;
            }
            var self = this;
            // Browse all widgets
            _.each(this.renderer.allFieldWidgets, function (field) {
                _.each(field, function (widget) {
                    var field = widget.name;
                    if (field in orderedBy[formKey]) {
                        // Retrieve model from widget dynamic-id
                        var list = self.model.localData[widget.renderer.state.id];
                        // Apply order-by and refresh widget only if needed
                        if (list.orderedBy != self.orderedBy[formKey][field]) {
                            list.orderedBy = self.orderedBy[formKey][field];
                            // Execute update like _onToggleColumnOrder
                            var state = self.model.get(self.handle);
                            self.renderer.confirmChange(state, state.id, [field]);
                        }
                    }
                });
            });
        },

        /**
         * Generate a unique key based on model name and its id
         */
        getFormKey: function () {
            return  this.renderer.state.model + ',' + this.renderer.state.res_id
        },

        /**
         * This method is called when someone tries to sort a column, most likely
         * in a x2many list view
         *
         * @private
         * @param {OdooEvent} event
         */
        _onToggleColumnOrder: function (event) {
            var res = this._super(event);
            // Create a unique key for this form
            var formKey = this.getFormKey();
            if (!(formKey in this.orderedBy )) {
                this.orderedBy[formKey] = {};
            }
            // Store formatted orderedBy that will be re-apply after an update
            var list = this.model.localData[event.data.id];
            this.orderedBy[formKey][event.data.field] = list.orderedBy;
            return res;
        },

    });

});

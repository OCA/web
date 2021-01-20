// Copyright 2020 Tecnativa - Alexandre Díaz
// License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).
odoo.define('web_pwa_cache.FormPWAController', function (require) {
    "use strict";

    var core = require("web.core");
    var Sidebar = require('web.Sidebar');
    var FormController = require('web.FormController');

    var _t = core._t;


    var FormPWAController = FormController.extend({
        createRecord: function (parentID) {
            var self = this;
            var record = this.model.get(this.handle, {raw: true});
            return this.model.load({
                context: record.getContext(),
                fields: record.fields,
                fieldsInfo: record.fieldsInfo,
                modelName: this.modelName,
                parentID: parentID,
                res_ids: record.res_ids,
                type: 'record',
                viewType: 'formPWA',
            }).then(function (handle) {
                self.handle = handle;
                self._updateEnv();
                return self._setMode('edit');
            });
        },
        renderSidebar: function ($node) {
            if (this.hasSidebar) {
                var otherItems = [];
                if (this.is_action_enabled('delete')) {
                    otherItems.push({
                        label: _t('Delete'),
                        callback: this._onDeleteRecord.bind(this),
                    });
                }
                if (this.is_action_enabled('create') && this.is_action_enabled('duplicate')) {
                    otherItems.push({
                        label: _t('Duplicate'),
                        callback: this._onDuplicateRecord.bind(this),
                    });
                }
                this.sidebar = new Sidebar(this, {
                    editable: this.is_action_enabled('edit'),
                    viewType: 'formPWA',
                    env: {
                        context: this.model.get(this.handle).getContext(),
                        activeIds: this.getSelectedIds(),
                        model: this.modelName,
                    },
                    actions: _.extend(this.toolbarActions, {other: otherItems}),
                });
                this.sidebar.appendTo($node);

                // Show or hide the sidebar according to the view mode
                this._updateSidebar();
            }
        },
        update: function (params, options) {
            var sparams = _.extend({viewType: 'formPWA', mode: this.mode}, params);
            return this._super(sparams, options);
        },
    });

    return FormPWAController;

});

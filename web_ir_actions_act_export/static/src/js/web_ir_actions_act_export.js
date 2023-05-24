/* Copyright 2021 Level Prime Srl
 * License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl). */


odoo.define("web_ir_actions_act_export.ir_actions_act_export", function(require) {
    "use strict";

    var ActionManager = require("web.ActionManager");
    var DataExport = require('web.DataExport');

    ActionManager.include({
        /**
         * Intercept action handling to detect extra action type
         * @override
         */
        _handleAction: function(action, options) {
            if (action.type === "ir.actions.act_export") {
                return this._executeDataExportAction(action, options);
            }
            return this._super.apply(this, arguments);
        },

        /**
         * Handle 'ir.actions.act_export' action
         * @param {Object} action see _handleAction() parameters
         * @param {Object} options see _handleAction() parameters
         * @returns {$.Promise}
         */
        _executeDataExportAction: function(action, options) {
            const self = this;
            const context = action.context;
            const domain = [['id', 'in', context.active_ids]];
            var def = this._rpc({
                    model: context.active_model,
                    method: 'search_read',
                    fields: ['id'],
                    args: [domain],
                })
                .then(function (res) {
                      var record = res;
                      record.model = context.active_model;
                      record.getContext = function() {
                          return context;
                      }
                      self.getActiveDomain = function () {
                            return $.when(domain);
                      }
                      record.getParent = function () {
                            return self;
                      }

                      new DataExport(self, record, {}).open();
                });

            return $.when(def);
        },
    });
});


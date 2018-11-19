// Copyright 2017 - 2018 Modoolar <info@modoolar.com>
// Copyright 2018 Modoolar <info@modoolar.com>
// License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).
odoo.define('web_ir_actions_act_view_reload.ir_actions_act_view_reload', function (require) {
    "use strict";

    var ActionManager = require('web.ActionManager');

    ActionManager.include({

        /**
         * Intersept action handling to detect extra action type
         * @override
         */
        _handleAction: function (action, options) {
            if (action.type === 'ir.actions.act_view_reload') {
                return this._executeReloadAction(action, options);
            }

            return this._super.apply(this, arguments);
        },

        /**
         * Handle 'ir.actions.act_view_reload' action
         * @returns {$.Promise}
         */
        _executeReloadAction: function () {
            var controller = this.getCurrentController();
            if (controller && controller.widget) {
                controller.widget.reload();
            }

            return $.when();
        },

    });

});

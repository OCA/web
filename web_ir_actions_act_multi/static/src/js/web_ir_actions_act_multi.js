// Copyright 2017 - 2018 Modoolar <info@modoolar.com>
// Copyright 2018 Brainbean Apps <hello@brainbeanapps.com>
// Copyright 2020 Manuel Calero - Tecnativa
// License LGPLv3.0 or later (https://www.gnu.org/licenses/lgpl-3.0.en.html).

odoo.define("web_ir_actions_act_multi.ir_actions_act_multi", function (require) {
    "use strict";

    var ActionManager = require("web.ActionManager");

    ActionManager.include({
        /**
         * Intercept action handling to detect extra action type
         * @override
         */
        _handleAction: function (action, options) {
            if (action.type === "ir.actions.act_multi") {
                return this._executeMultiAction(action, options);
            }
            return this._super.apply(this, arguments);
        },

        /**
         * Handle 'ir.actions.act_multi' action
         * @param {Object} action see _handleAction() parameters
         * @param {Object} options see _handleAction() parameters
         * @returns {$.Promise}
         */
        _executeMultiAction: function (action, options) {
            const self = this;

            return action.actions
                .map((item) => {
                    return () => {
                        return self._handleAction(item, options);
                    };
                })
                .reduce((prev, cur) => {
                    return prev.then(cur);
                }, Promise.resolve());
        },
    });
});

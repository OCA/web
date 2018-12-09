// Copyright 2017 - 2018 Modoolar <info@modoolar.com>
// Copyright 2018 Brainbean Apps <hello@brainbeanapps.com>
// License LGPLv3.0 or later (https://www.gnu.org/licenses/lgpl-3.0.en.html).

odoo.define('web_ir_actions_act_multi.ir_actions_act_multi', function (require) {
    "use strict";

    var ActionManager = require('web.ActionManager');

    ActionManager.include({

        /**
         * Intercept action handling to detect extra action type
         * @override
         */
        _handleAction: function (action, options) {
            if (action.type === 'ir.actions.act_multi') {
                return this._executeMultiAction(action, options);
            }

            return this._super.apply(this, arguments);
        },

        /**
         * Handle 'ir.actions.act_multi' action
         * @param {Object} action see _handleAction() parameters
         * @param {Object} options see _handleAction() parameters
         * @param {integer|undefined} index Index of action being handled
         * @returns {$.Promise}
         */
        _executeMultiAction: function (action, options, index) {
            var self = this;

            if (index === undefined) {
                index = 0; // eslint-disable-line no-param-reassign
            }

            if (index === action.actions.length - 1) {
                return this._handleAction(action.actions[index], options);
            } else if (index >= action.actions.length) {
                return $.when();
            }

            return this
                ._handleAction(action.actions[index], options)
                .then(function () {
                    return self._executeMultiAction(action, options, index + 1);
                });
        },

    });

});

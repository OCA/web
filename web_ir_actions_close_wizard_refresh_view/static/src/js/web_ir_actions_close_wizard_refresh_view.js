/* Copyright 2019 LevelPrime
 * License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl). */

odoo.define('web_ir_actions_close_wizard_refresh_view', function (require) {
    'use strict';

    require('web.ActionManager').include({
        _handleAction: function (action, options) {
            if (action.type === 'ir.actions.close_wizard_refresh_view') {
                return this._executeCloseWizardRefreshViewAction();
            }
            return this._super(action, options);
        },
        _executeCloseWizardRefreshViewAction: function () {
            this._closeDialog();

            var state = this._getControllerState(
                this.getCurrentController().jsID);

            return $.when(this.loadState(state));
        },
    });
});

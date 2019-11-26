/* Copyright 2019 LevelPrime
 * License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl). */

odoo.define('web_ir_actions_close_wizard_refresh_view', function (require) {
    'use strict';

    require('web.ActionManager').include({
        ir_actions_close_wizard_refresh_view: function (action, options) {
            if (!this.dialog) {
                options.on_close();
            }
            this.dialog_stop();

            var view =
                this.inner_widget.views[this.inner_widget.active_view.type];

            if (view) {
                view.controller.reload();
            }
            return $.when();
        },
    });
});

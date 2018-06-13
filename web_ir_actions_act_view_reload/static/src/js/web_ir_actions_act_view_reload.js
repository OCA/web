// Copyright 2017 - 2018 Modoolar <info@modoolar.com>
// License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).
odoo.define('web_ir_actions_act_view_reload.ir_actions_act_view_reload', function (require) {
"use strict";

    var ActionManager = require('web.ActionManager');

    ActionManager.include({
        ir_actions_act_view_reload: function (action, options) {
            if (this.inner_widget && this.inner_widget.active_view && this.inner_widget.active_view.controller)
                this.inner_widget.active_view.controller.reload();
            return $.when();
        }
    });

});

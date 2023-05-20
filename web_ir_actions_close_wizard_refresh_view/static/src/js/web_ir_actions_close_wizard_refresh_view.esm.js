/** @odoo-module **/

import {registry} from "@web/core/registry";

async function executeCloseAndRefreshView({env, action}) {
    const actionService = env.services.action;
    const originalAction = action._originalAction;
    return actionService.doAction(
        {type: "ir.actions.act_window_close"},
        {
            onClose: function () {
                actionService.doAction(originalAction);
            },
        }
    );
}

registry
    .category("action_handlers")
    .add("ir.actions.close_wizard_refresh_view", executeCloseAndRefreshView);

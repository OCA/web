/** @odoo-module **/

import {registry} from "@web/core/registry";

/**
 * Handle 'ir.actions.act_view_reload' action
 * @param {object} action see _handleAction() parameters
 * @returns {$.Promise}
 */

async function _executeReloadAction(params) {
    var controller = params.env.services.action.currentController;
    if (controller) {
        if (!controller.props.state) {
            params.env.bus.trigger("ROUTE_CHANGE");
        }
        params.env.bus.trigger("ACTION_MANAGER:UPDATE", controller.__info__);
    }
    return Promise.resolve();
}

registry
    .category("action_handlers")
    .add("ir.actions.act_view_reload", _executeReloadAction);

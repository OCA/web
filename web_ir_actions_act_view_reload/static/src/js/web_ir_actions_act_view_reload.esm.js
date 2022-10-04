/** @odoo-module **/
// Copyright 2017 - 2018 Modoolar <info@modoolar.com>
// Copyright 2018 Modoolar <info@modoolar.com>
// License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl).

import {registry} from "@web/core/registry";
const actionHandlersRegistry = registry.category("action_handlers");

function ir_actions_act_view_reload(args) {
    // Odoo v15 is running in "legacy" mode - some of the JS
    // is written in Owl, some is still legacy (e.g. controllers
    // are still written in the old system - hence below hack)

    // TODO: for Odoo v16, this will probably need to be re-written in Owl
    // REF: https://github.com/odoo/odoo/blob/7054fd6beb4f417efa4b22aafe8b935dd6ade123/addons/web/static/src/webclient/actions/action_service.js#L1257-L1267

    const controller = args.env.services.action.currentController;
    if (controller) {
        const {__legacy_widget__} = controller.getLocalState();
        if (__legacy_widget__) {
            __legacy_widget__.reload({});
        }
    }
    return Promise.resolve();
}

actionHandlersRegistry.add("ir.actions.act_view_reload", ir_actions_act_view_reload);

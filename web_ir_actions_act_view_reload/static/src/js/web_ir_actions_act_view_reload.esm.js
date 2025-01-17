/** @odoo-module **/
// Copyright 2017 - 2018 Modoolar <info@modoolar.com>
// Copyright 2018 Modoolar <info@modoolar.com>
// License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl).

import {registry} from "@web/core/registry";

export function irActionsActViewReload({env, action}) {
    const currentController = env.services.action.currentController;

    if (currentController) {
        location.reload();
    }

    return Promise.resolve();
}
registry
    .category("action_handlers")
    .add("ir.actions.act_view_reload", irActionsActViewReload);

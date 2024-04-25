/** @odoo-module **/

import {ActWindowMessageDialog} from "./web_ir_actions_act_window_msg_component.esm";
import {registry} from "@web/core/registry";

// Define a function to open the dialog
function openDialog({env, action}) {
    // Created new Dialog widget.
    env.services.dialog.add(ActWindowMessageDialog, {
        title: action.title,
        body: action.message,
        action: action,
        is_html_message: action.is_html_message,
        size: "md",
        env: env,
    });
}

registry.category("action_handlers").add("ir.actions.act_window.message", openDialog);

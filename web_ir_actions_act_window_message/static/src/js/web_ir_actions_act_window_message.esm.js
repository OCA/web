import {ActWindowMessageDialog} from "./web_ir_actions_act_window_msg_component.esm";
import {markup} from "@odoo/owl";
import {registry} from "@web/core/registry";

// Define a function to open the dialog
function openDialog({env, action}) {
    // Created new Dialog widget.
    env.services.dialog.add(ActWindowMessageDialog, {
        title: action.title,
        body: action.is_html_message ? markup(action.message) : action.message,
        action: action,
        is_html_message: action.is_html_message,
        size: "md",
    });
}

registry.category("action_handlers").add("ir.actions.act_window.message", openDialog);

/** @odoo-module **/

import {Component, onWillStart, useState} from "@odoo/owl";
import {Dialog} from "@web/core/dialog/dialog";
import {_t} from "@web/core/l10n/translation";

export class ActWindowMessageDialog extends Component {
    setup() {
        this.state = useState({
            buttons: [],
        });
        onWillStart(this.willStart);
    }

    async willStart() {
        this.generateButtons();
    }

    _refreshWidget(env) {
        const controller = env.services.action.currentController;
        const state = env.services.router.current.hash;
        const props = controller.props;
        env.services.action.switchView(props.type, {resId: state.id});
    }

    generateButtons() {
        var self = this;
        const action = self.props.action;
        const env = self.props.env;
        if (action.close_button_title !== false) {
            self.state.buttons.push({
                name: action.close_button_title || _t("Close"),
                click: () => {
                    // Refresh the view before closing the dialog
                    self._refreshWidget(env);
                    self.props.close();
                },
                classes: "btn btn-default",
            });
        }
        for (var i = 0; i < action.buttons.length; i++) {
            const button = action.buttons[i];
            const button_data = {
                name: button.name || "No name set",
                classes: button.classes || "btn btn-default",
                click: () => {
                    if (button.type === "method") {
                        env.services
                            .rpc("/web/dataset/call_button", {
                                model: button.model,
                                method: button.method,
                                args: button.args,
                                kwargs: button.kwargs,
                            })
                            .then(function (result) {
                                if (typeof result === "object") {
                                    return env.services.action.doAction(result);
                                }
                                self._refreshWidget(env);
                            });
                    } else {
                        return env.services.action.doAction(button);
                    }
                    self.props.close();
                },
            };
            self.state.buttons.push(button_data);
        }
    }
}

ActWindowMessageDialog.template =
    "web_ir_actions_act_window_message.ActWindowMessageDialog";
ActWindowMessageDialog.components = {
    Dialog,
};
ActWindowMessageDialog.props = {
    title: {
        type: String,
        optional: true,
    },
    body: {
        type: String,
        optional: true,
    },
    action: {type: Object, optional: true},
    env: {type: Object, optional: true},
    is_html_message: {type: Boolean, optional: true},
    size: {type: String},
    close: Function,
};

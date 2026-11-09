import {Component, t, useProps} from "@odoo/owl";
import {Dialog} from "@web/core/dialog/dialog";
import {_t} from "@web/core/l10n/translation";
import {router} from "@web/core/browser/router";
import {useService} from "@web/core/utils/hooks";

export class ActWindowMessageDialog extends Component {
    props = useProps({
        title: t.string().optional(),
        body: t.string().optional(),
        action: t.object(),
        is_html_message: t.boolean().optional(false),
        size: t.string(),
        close: t.function(),
    });

    setup() {
        this.orm = useService("orm");
        this.action = useService("action");
        this.buttons = [];
        this.generateButtons();
    }

    _refreshWidget() {
        const controller = this.action.currentController;
        const state = router.current;
        if (!controller || !controller.props || !state || !state.resId) {
            console.warn("ActWindowMessageDialog: unable to refresh view");
            return;
        }
        const props = controller.props;
        if (!props.type) {
            console.warn("Controller props.type is missing, cannot switch view");
            return;
        }
        this.action
            .switchView(props.type, {
                resId: state.resId,
            })
            .catch((err) => {
                console.error("Error updating the view:", err);
                window.location.reload();
            });
    }

    generateButtons() {
        var self = this;
        const action = self.props.action;
        if (action.close_button_title !== false) {
            self.buttons.push({
                name: action.close_button_title || _t("Close"),
                click: () => {
                    self._refreshWidget();
                    self.props.close();
                },
                classes: "btn btn-default",
            });
        }
        for (var i = 0; action.buttons && i < action.buttons.length; i++) {
            const button = action.buttons[i];
            const button_data = {
                name: button.name || "No name set",
                classes: button.classes || "btn btn-default",
                click: () => {
                    if (button.type === "method") {
                        self.orm
                            .call(
                                button.model,
                                button.method,
                                button.args,
                                button.kwargs
                            )
                            .then((result) => {
                                if (typeof result === "object") {
                                    return self.action.doAction(result).then(() => {
                                        self.props.close();
                                    });
                                }
                                self._refreshWidget();
                            });
                    } else {
                        return self.action.doAction(button).then(() => {
                            self.props.close();
                        });
                    }
                },
            };
            self.buttons.push(button_data);
        }
    }
}

ActWindowMessageDialog.template =
    "web_ir_actions_act_window_message.ActWindowMessageDialog";
ActWindowMessageDialog.components = {
    Dialog,
};

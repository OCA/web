/* Copyright 2017 Therp BV, ACSONE SA/NV
 *  * License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl). */

odoo.define("web.web_ir_actions_act_window_message", function (require) {
    "use strict";

    var ActionManager = require("web.ActionManager"),
        core = require("web.core"),
        Dialog = require("web.Dialog");

    var _t = core._t;

    ActionManager.include({
        _handleAction: function (action, options) {
            if (action.type === "ir.actions.act_window.message") {
                return this._executeWindowMessageAction(action, options);
            }
            return this._super.apply(this, arguments);
        },
        _executeWindowMessageAction: function (action, options) {
            var self = this,
                buttons = [];

            if (action.close_button_title !== false) {
                buttons.push({
                    text: action.close_button_title || _t("Close"),
                    click: function () {
                        // Refresh the view before closing the dialog
                        var controller = self.getCurrentController();
                        if (controller && controller.widget) {
                            controller.widget.reload();
                        }
                    },
                    classes: "btn-default",
                });
            }

            var is_html = action.is_html_message === true;
            var content_properties = {};

            if (is_html) {
                content_properties = {
                    html: action.message,
                };
            } else {
                content_properties = {
                    text: action.message,
                    css: {
                        "white-space": "pre-line",
                    },
                };
            }

            var dialog = new Dialog(
                this,
                _.extend(
                    {
                        size: "medium",
                        title: action.title,
                        $content: $("<div>", content_properties),
                        buttons: buttons.concat(
                            this.ir_actions_act_window_message_get_buttons(
                                action,
                                function () {
                                    dialog.close();
                                }
                            )
                        ),
                    },
                    options
                )
            );
            return dialog.open()._opened;
        },
        ir_actions_act_window_message_get_buttons: function (action, close_func) {
            // Return an array of button definitions from action
            var self = this;
            return _.map(action.buttons || [], function (button_definition) {
                return {
                    text: button_definition.name || "No name set",
                    classes: button_definition.classes || "btn-default",
                    click: function () {
                        if (button_definition.type === "method") {
                            self._rpc({
                                model: button_definition.model,
                                method: button_definition.method,
                                args: button_definition.args,
                                kwargs: button_definition.kwargs,
                            }).then(function (result) {
                                if (_.isObject(result)) {
                                    self.do_action(result);
                                }
                                // Always refresh the view after the action
                                // ex: action updates a status
                                var controller = self.getCurrentController();
                                if (controller && controller.widget) {
                                    controller.widget.reload();
                                }
                            });
                        } else {
                            self.do_action(button_definition);
                        }
                        close_func();
                    },
                };
            });
        },
    });
});

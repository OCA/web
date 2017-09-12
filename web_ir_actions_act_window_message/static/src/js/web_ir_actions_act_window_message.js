/* Copyright 2017 Therp BV, ACSONE SA/NV
 *  * License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl). */

odoo.define('web.web_ir_actions_act_window_message', function(require)
{
    "use strict";

    var ActionManager = require('web.ActionManager'),
        core = require('web.core'),
        Model = require('web.Model'),
        Dialog = require('web.Dialog');

    var _t = core._t;

    ActionManager.include({
        ir_actions_act_window_message: function(action, options)
        {
            var self = this,
                buttons = [];

            if(action.close_button_title !== false)
            {
                buttons.push({
                    text: action.close_button_title || _t('Close'),
                    click: function() {
                        // refresh the view before closing the dialog
                        self.inner_widget.active_view
                            .controller.recursive_reload();
                        dialog.close()
                    },
                    classes: 'btn-default',
                })
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
                        'white-space': 'pre-line',
                    }
                };
            }

            var dialog = new Dialog(
                this,
                _.extend(
                    {
                        size: 'medium',
                        title: action.title,
                        $content: $('<div>', content_properties),
                        buttons: buttons.concat(
                            this.ir_actions_act_window_message_get_buttons(
                                action, function() { dialog.close() })
                        ),
                    },
                    options)
            )
            return dialog.open();
        },
        ir_actions_act_window_message_get_buttons: function(action, close_func)
        {
            // return an array of button definitions from action
            var self = this;
            return _.map(action.buttons || [], function(button_definition)
            {
                return {
                    text: button_definition.name || 'No name set',
                    classes: button_definition.classes || 'btn-default',
                    click: function() {
                        if(button_definition.type == 'method')
                        {
                            (new Model(button_definition.model))
                            .call(
                                button_definition.method,
                                button_definition.args,
                                button_definition.kwargs
                            ).then(function(result)
                            {
                                if(_.isObject(result))
                                {
                                    self.do_action(result);
                                }
                                // always refresh the view after the action
                                // ex: action updates a status
                                self.inner_widget.active_view
                                .controller.recursive_reload();
                            });
                        }
                        else
                        {
                            self.do_action(button_definition);
                        }
                        close_func();
                    },
                }
            });
        },
    });
});

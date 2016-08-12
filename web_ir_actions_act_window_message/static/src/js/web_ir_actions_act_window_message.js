//-*- coding: utf-8 -*-
//############################################################################
//
//   OpenERP, Open Source Management Solution
//   This module copyright (C) 2015 Therp BV <http://therp.nl>.
//
//   This program is free software: you can redistribute it and/or modify
//   it under the terms of the GNU Affero General Public License as
//   published by the Free Software Foundation, either version 3 of the
//   License, or (at your option) any later version.
//
//   This program is distributed in the hope that it will be useful,
//   but WITHOUT ANY WARRANTY; without even the implied warranty of
//   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//   GNU Affero General Public License for more details.
//
//   You should have received a copy of the GNU Affero General Public License
//   along with this program.  If not, see <http://www.gnu.org/licenses/>.
//
//############################################################################

odoo.define('web_ir_actions_act_window_message.open_dialog_box', function(require) {
    "user strict";

    var ActionManager = require('web.ActionManager');
    var Dialog = require('web.Dialog');
    var core = require('web.core');
    var _t = core._t

    ActionManager.include({
        ir_actions_act_window_message: function(action, options) {
            var self = this,
                buttons = [];

            if (action.close_button_title !== false) {
                buttons.push({
                    text: action.close_button_title ||
                        _t('Close'),
                    close: true,
                    oe_link_class: 'oe_highlight',
                })
            } else {
                buttons.concat(
                    this.ir_actions_act_window_message_get_buttons(
                        action, {
                            close: true
                        })
                )
            }

            new Dialog(this, {
                size: 'medium',
                buttons: buttons,
                title: action.title,
                $content: $('<div>', {
                    text: action.message,
                }),
            }).open();

        },
        ir_actions_act_window_message_get_buttons: function(action, close_func) {
            // return an array of button definitions from action
            var self = this;
            return _.map(action.buttons || [], function(button_definition) {
                return {
                    text: button_definition.name || 'No name set',
                    oe_link_class: button_definition.oe_link_class ||
                        'oe_highlight',
                    click: function() {
                        if (button_definition.type == 'method') {
                            (new instance.web.Model(button_definition.model))
                            .call(
                                button_definition.method,
                                button_definition.args,
                                button_definition.kwargs
                            ).then(function(result) {
                                if (_.isObject(result)) {
                                    self.do_action(result);
                                } else {
                                    if (
                                        self.inner_widget &&
                                        self.inner_widget.views
                                    ) {
                                        self.inner_widget
                                            .views[self.inner_widget.active_view]
                                            .controller.recursive_reload();
                                    }
                                }
                            });
                        } else {
                            self.do_action(button_definition);
                        }
                        close_func();
                    },
                }
            });
        },
    });
});

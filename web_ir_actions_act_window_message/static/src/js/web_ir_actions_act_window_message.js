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

openerp.web_ir_actions_act_window_message = function(instance)
{
    instance.web.ActionManager.include({
        ir_actions_act_window_message: function(action, options)
        {
            var dialog = new instance.web.Dialog(
                this,
                {
                    size: 'medium',
                    title: action.title,
                    $content: $('<div>', {
                      html: action.message,
                    }),
                    buttons: [
                        {
                            text: instance.web._t('Close'),
                            click: function() { dialog.close() },
                            oe_link_class: 'oe_highlight',
                        },
                    ],
                },
                jQuery(instance.web.qweb.render(
                    'web_ir_actions_act_window_message',
                    {
                        'this': this,
                        'action': action,
                    }))
            )
            return dialog.open();
        },
    });
}

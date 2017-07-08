//-*- coding: utf-8 -*-
//############################################################################
//
//   OpenERP, Open Source Management Solution
//   This module copyright (C) 2013-2015 Therp BV (<http://therp.nl>).
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

openerp.web_ir_actions_act_window_page = function(instance)
{
    instance.web.ActionManager.include({
        ir_actions_act_window_page_prev: function(action, options)
        {
            if(this.inner_widget && this.inner_widget.active_view == 'form' &&
                this.inner_widget.views[this.inner_widget.active_view])
            {
                this.inner_widget.views[this.inner_widget.active_view]
                    .controller.execute_pager_action('previous');
            }
            if(options && options.on_close)
            {
                options.on_close();
            }
        },
        ir_actions_act_window_page_next: function(action, options)
        {
            if(this.inner_widget && this.inner_widget.active_view == 'form' &&
                this.inner_widget.views[this.inner_widget.active_view])
            {
                this.inner_widget.views[this.inner_widget.active_view]
                    .controller.execute_pager_action('next');
            }
            if(options && options.on_close)
            {
                options.on_close();
            }
        },
    });
}

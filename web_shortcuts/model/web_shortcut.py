# -*- coding: utf-8 -*-
##############################################################################
#
#    OpenERP, Open Source Management Solution
#    Copyright (C) 2004-today OpenERP SA (<http://www.openerp.com>)
#
#    This program is free software: you can redistribute it and/or modify
#    it under the terms of the GNU Affero General Public License as
#    published by the Free Software Foundation, either version 3 of the
#    License, or (at your option) any later version.
#
#    This program is distributed in the hope that it will be useful,
#    but WITHOUT ANY WARRANTY; without even the implied warranty of
#    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
#    GNU Affero General Public License for more details.
#
#    You should have received a copy of the GNU Affero General Public License
#    along with this program.  If not, see <http://www.gnu.org/licenses/>.
#
##############################################################################

from openerp import models, fields, api


class web_shortcut(models.Model):
    _name = 'web.shortcut'

    name = fields.Char('Shortcut Name', size=64)
    menu_id = fields.Many2one('ir.ui.menu')
    user_id = fields.Many2one('res.users', 'User Ref.', required=True,
                              ondelete='cascade', select=True,
                              default=lambda obj, cr, uid, context: uid)

    _sql_constraints = [
        ('shortcut_unique', 'unique(menu_id,user_id)',
         'Shortcut for this menu already exists!'),
    ]

    @api.model
    def get_user_shortcuts(self, user_id):
        shortcuts = self.search([('user_id', '=', user_id)])
        results = shortcuts.read(['menu_id'])
        ir_ui_menu_obj = self.env['ir.ui.menu']
        menus = ir_ui_menu_obj.search([('id', 'in', [x['menu_id'][0]
                                                     for x in results])])
        name_map = dict(menus.name_get())
        # Make sure to return only shortcuts pointing to existing menu items.
        filtered_results = filter(lambda result: result['menu_id'][0] in
                                  name_map, results)
        for result in filtered_results:
            result.update(name=name_map[result['menu_id'][0]])
        return filtered_results

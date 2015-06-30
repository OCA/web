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
        res = []
        for shortcut in shortcuts:
            if shortcut.menu_id:
                _name = shortcut.menu_id.name_get()
                _name = _name[0][1] if len(_name) else ''
                _id = shortcut.menu_id.id
                res.append(
                    {
                        'id': shortcut.id,
                        'name': _name,
                        'menu_id': (_id, _name)
                    }
                )
        return res

# -*- coding: utf-8 -*-
# Copyright 2004-today Odoo SA (<http://www.odoo.com>)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

from odoo import models, fields, api


class WebShortcut(models.Model):
    _name = 'web.shortcut'

    name = fields.Char('Shortcut Name', size=64)
    menu_id = fields.Many2one('ir.ui.menu', ondelete='cascade')
    user_id = fields.Many2one('res.users', 'User Ref.', required=True,
                              ondelete='cascade', index=True,
                              default=lambda self: self.env.user.id)

    _sql_constraints = [
        ('shortcut_unique', 'unique(menu_id,user_id)',
         'Shortcut for this menu already exists!'),
    ]

    @api.model
    def get_user_shortcuts(self):
        shortcuts = self.search([('user_id', '=', self.env.user.id)])
        res = []
        trans = self.env['ir.translation']
        for shortcut in shortcuts.filtered('menu_id'):
            name_translated = trans._get_source('ir.ui.menu,name', 'model', self.env.user.lang, shortcut.menu_id.name,
                                                shortcut.menu_id.id)
            current = shortcut.menu_id
            while current.parent_id:
                current = current.parent_id
                name_translated = ' / '.join((trans._get_source('ir.ui.menu,name', 'model', self.env.user.lang,
                                                                current.name, current.id), name_translated))
            _name = shortcut.menu_id.name_get()
            _name = _name[0][1] if len(_name) else ''
            _id = shortcut.menu_id.id
            res.append(
                {
                    'id': shortcut.id,
                    'name': name_translated,
                    'menu_id': (_id, _name)
                }
            )
        return res

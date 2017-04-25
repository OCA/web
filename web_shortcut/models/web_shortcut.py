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
                              default=lambda obj, cr, uid, context: uid)

    _sql_constraints = [
        ('shortcut_unique', 'unique(menu_id,user_id)',
         'Shortcut for this menu already exists!'),
    ]

    @api.model
    def get_user_shortcuts(self):
        shortcuts = self.with_context(
            {'lang': self.env.user.lang}
        ).search([('user_id', '=', self.env.user.id)])
        res = []
        for shortcut in shortcuts.filtered('menu_id'):
            _id = shortcut.menu_id.id
            res.append(
                {
                    'id': shortcut.id,
                    'name': shortcut.menu_id.complete_name,
                    'menu_id': (_id, shortcut.menu_id.complete_name)
                }
            )
        return res

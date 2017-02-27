# -*- coding: utf-8 -*-
# Copyright 2017-today Onestein (<http://www.onestein.eu>)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from openerp.tests.common import TransactionCase


class TestWebShortcut(TransactionCase):
    def setUp(self, *args, **kwargs):
        super(TestWebShortcut, self).setUp(*args, **kwargs)
        self.shortcut_obj = self.env['web.shortcut']
        self.menu_obj = self.env['ir.ui.menu']

        self.menu = self.env.ref('base.menu_ir_property')
        self.user = self.env.ref('base.user_root')

        self.shortcut_obj.search([('user_id', '=', self.user.id)]).unlink()

    def test_web_shortcut(self):
        res = self.shortcut_obj.get_user_shortcuts()
        self.assertEqual(len(res), 0)
        self.shortcut_obj.create({
            'name': 'Test',
            'menu_id': self.menu.id,
            'user_id': self.env.user.id
        })
        res = self.shortcut_obj.get_user_shortcuts()
        self.assertEqual(len(res), 1)
        self.menu.unlink()
        res = self.shortcut_obj.get_user_shortcuts()
        self.assertEqual(len(res), 0)

# -*- coding: utf-8 -*-
# Copyright 2017 Therp BV <http://therp.nl>
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
from openerp.exceptions import ValidationError
from openerp.tests.common import TransactionCase


class TestWebListviewCustomColumn(TransactionCase):

    post_install = True
    at_install = False

    def test_web_listview_custom_column(self):
        view = self.env.ref('base.module_tree')
        ir_module_module = self.env['ir.module.module']
        view.custom_column({
            'type': 'user', 'operation': 'add', 'name': 'display_name',
        })
        self.assertIn(
            'display_name',
            ir_module_module
            .fields_view_get(view_id=view.id)['arch']
        )
        view.custom_column({
            'type': 'user', 'operation': 'left', 'name': 'display_name',
        })
        view.custom_column({
            'type': 'user', 'operation': 'right', 'name': 'display_name',
        })
        view.custom_column({
            'type': 'user', 'operation': 'remove', 'name': 'display_name',
        })
        self.assertNotIn(
            'display_name',
            ir_module_module
            .fields_view_get(view_id=view.id)['arch']
        )
        view.custom_column({
            'type': 'user', 'operation': 'to_all',
        })
        self.assertFalse(
            self.env.ref(view._custom_column_xmlid({'type': 'user'}), False)
        )
        self.assertTrue(
            self.env.ref(view._custom_column_xmlid({'type': 'all'}))
        )
        view.custom_column({
            'type': 'all', 'operation': 'to_user',
        })
        self.assertTrue(
            self.env.ref(view._custom_column_xmlid({'type': 'all'}))
        )
        self.assertTrue(
            self.env.ref(view._custom_column_xmlid({'type': 'user'}))
        )
        view.custom_column({
            'type': 'user', 'operation': 'reset',
        })
        self.assertFalse(
            self.env.ref(view._custom_column_xmlid({'type': 'user'}), False)
        )
        # do a `all` change on a view as userB, verify that userA sees it
        # as userA try to change it, verify that you get the right exception
        userA = self.env.user
        userB = self.env.user.copy()
        self.assertNotIn(
            'display_name',
            ir_module_module.sudo(
                userA.id).fields_view_get(
                    view_id=view.id)['arch'])
        self.assertNotIn(
            'display_name',
            ir_module_module.sudo(
                userB.id).fields_view_get(
                    view_id=view.id)['arch'])
        view.custom_column({
            'type': 'all',
            'operation': 'add',
            'name': 'display_name',
        })
        self.assertIn(
            'display_name',
            ir_module_module.sudo(
                userA.id).fields_view_get(
                    view_id=view.id)['arch'])
        self.assertIn(
            'display_name',
            ir_module_module.sudo(
                userB.id).fields_view_get(
                    view_id=view.id)['arch'])
        with self.assertRaises(ValidationError):
            view.sudo(userB.id).custom_column({
                'type': 'user', 'operation': 'reset',
            })

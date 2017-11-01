# -*- coding: utf-8 -*-
# Copyright 2017 Therp BV <http://therp.nl>
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
from openerp.tests.common import TransactionCase


class TestWebListviewCustomColumn(TransactionCase):
    def test_web_listview_custom_column(self):
        view = self.env.ref('base.module_tree')
        view.custom_column({
            'type': 'user', 'operation': 'add', 'name': 'display_name',
        })
        self.assertIn(
            'display_name',
            self.env['ir.module.module']
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
            self.env['ir.module.module']
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

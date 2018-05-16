# -*- coding: utf-8 -*-
# Copyright 2018 Bejaoui Souheil <souheil_bejaoui@hotmail.fr>
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

from odoo.tests.common import TransactionCase


class TestIrFilters(TransactionCase):
    def setUp(self):
        super(TestIrFilters, self).setUp()
        self.filter_object = self.env['ir.filters'].create(
            {
                'name': 'custom filter',
                'model_id': 'ir.module.module',
                'domain': '[]',
                'user_id': False,
                'description': 'custom filter description',
            }
        )

    def test_create_filter_with_description(self):
        res = self.env['ir.filters'].get_filters(model='ir.module.module')
        if res:
            self.assertIn('description', res[0].keys())
            self.assertIn(
                'custom filter description',
                list(map(lambda f: f['description'], res)),
            )

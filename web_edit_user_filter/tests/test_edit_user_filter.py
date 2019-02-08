# Copyright 2019 Onestein
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

from odoo.tests.common import SingleTransactionCase, post_install


@post_install(True)
class TestEditUserFilter(SingleTransactionCase):
    def test_filter_facet_inclusion(self):
        self.env['ir.filters'].create({
            'name': 'any2',
            'model_id': 'ir.filters',
            'domain': '[]',
            'facet': 'test2'
        })
        new_filter = self.env['ir.filters'].create({
            'name': 'any',
            'model_id': 'ir.filters',
            'domain': '[]',
            'facet': 'test'
        })
        res = self.env['ir.filters'].get_filters('ir.filters')
        self.assertTrue('facet' in res[0])
        self.assertEqual(
            list(
                filter(
                    lambda f: f['id'] == new_filter.id,
                    res
                )
            )[0]['facet'],
            'test'
        )

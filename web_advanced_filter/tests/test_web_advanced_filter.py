# Copyright 2020 Therp BV <https://therp.nl>
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl.html).
import json
from odoo.tests.common import TransactionCase


class TestWebAdvancedFilter(TransactionCase):
    def setUp(self):
        super().setUp()
        self.domain = [
            '|',
            ('id', '=', self.env.ref('base.res_partner_1').id),
            ('id', '=', self.env.ref('base.res_partner_2').id),
        ]
        self.domain_add = [
            '|',
            ('id', '=', self.env.ref('base.res_partner_3').id),
            ('id', '=', self.env.ref('base.res_partner_4').id),
        ]
        self.domain_remove = [
            '|',
            ('id', '=', self.env.ref('base.res_partner_3').id),
            ('id', '=', self.env.ref('base.res_partner_10').id),
        ]
        self.extra_partner = self.env.ref('base.res_partner_12')
        self.test_filter = self.env['ir.filters'].create({
            'name': 'testfilter',
            'domain': json.dumps(self.domain),
            'model_id': 'res.partner',
        })

    def test_union_existing(self):
        """test adding selections/domains to a filter"""
        self.assertEqual(
            self.env['res.partner'].search(self.domain),
            self.test_filter._evaluate(),
        )
        self._combine('union', self.domain_add)
        self.assertItemsEqual(
            self.env['res.partner'].search(self.domain) +
            self.env['res.partner'].search(self.domain_add),
            self.test_filter._evaluate(),
        )

        self.assertFalse(self.test_filter.is_frozen)
        self.test_filter.button_freeze()
        self.assertTrue(self.test_filter.is_frozen)

        # adding a set of ids to a frozen filter must result in a frozen filter
        # itself (=just a list of ids)
        self._combine('union', [('id', 'in', self.extra_partner.ids)])
        self.assertItemsEqual(
            self.extra_partner +
            self.env['res.partner'].search(self.domain) +
            self.env['res.partner'].search(self.domain_add),
            self.test_filter._evaluate(),
        )
        self.assertTrue(self.test_filter.is_frozen)

    def test_complement_existing(self):
        """test removing selections/domains from a filter"""
        self._combine('union', self.domain_add)
        self._combine('complement', self.domain_remove)
        self.assertItemsEqual(
            self.env['res.partner'].search(self.domain) +
            self.env['res.partner'].search(self.domain_add) -
            self.env['res.partner'].search(self.domain_remove),
            self.test_filter._evaluate(),
        )

        self.test_filter.button_freeze()

        remove_partner = self.env.ref('base.res_partner_1')
        self._combine('complement', [('id', 'in', remove_partner.ids)])
        self.assertItemsEqual(
            self.env['res.partner'].search(self.domain) +
            self.env['res.partner'].search(self.domain_add) -
            self.env['res.partner'].search(self.domain_remove) -
            remove_partner,
            self.test_filter._evaluate(),
        )
        self.assertTrue(self.test_filter.is_frozen)

    def test_x2many(self):
        """test if combined filters behave correctly for x2many fields"""
        self._combine(
            'complement', [(
                'category_id', 'in',
                self.env.ref('base.res_partner_category_12').ids,
            )],
        )
        self.assertTrue(
            self.test_filter.complement_filter_ids.evaluate_before_negate
        )
        self.assertFalse(
            self.test_filter.complement_filter_ids.evaluate_always
        )

    def test_computed_field(self):
        """computed fields always need evaluation"""
        self._combine('complement', [('display_name', '=', 'test')])
        self.assertTrue(
            self.test_filter.complement_filter_ids.evaluate_before_negate
        )
        self.assertTrue(
            self.test_filter.complement_filter_ids.evaluate_always
        )

    def _combine(self, action, domain):
        """run the combination wizard with some default values"""
        self.env['ir.filters.combine.with.existing'].create({
            'action': action,
            'domain': json.dumps(domain),
            'model': 'res.partner',
            'filter_id': self.test_filter.id
        }).button_save()

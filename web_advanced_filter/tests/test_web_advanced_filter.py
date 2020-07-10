# Copyright 2020 Therp BV <https://therp.nl>
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl.html).

import json
import uuid

from odoo.osv import expression
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
            self.test_filter.complement_filter_ids.evaluate_before_join
        )

    def test_computed_field(self):
        """computed fields always need evaluation"""
        self.assertTrue(
            self.env["res.groups"]._fields["full_name"].search,
            "res.groups.full_name doesn't have custom search, outdated test",
        )
        filt = self._create_filter(
            model_id="res.groups", domain=[("full_name", "=", "test")]
        )
        self.assertTrue(filt.evaluate_before_negate)
        self.assertTrue(filt.evaluate_before_join)

    def test_garbage_collection(self):
        helper1 = self._create_filter(active=False)
        helper2 = self._create_filter(active=False)
        helper3 = self._create_filter()
        filter1 = self._create_filter(
            unions=helper1, complements=helper2 | helper3
        )
        filter2 = self._create_filter(unions=helper1)
        self.assertTrue(helper1.exists())
        self.assertTrue(helper2.exists())

        filter1.unlink()
        # Still used by others → kept
        self.assertTrue(helper1.exists())
        # Not used by others → deleted
        self.assertFalse(helper2.exists())
        # Not a "hidden" filter → kept
        self.assertTrue(helper3.exists())

        filter2.write({"union_filter_ids": [(5, 0, 0)]})
        self.assertFalse(helper1.exists())
        self.assertFalse(helper2.exists())
        self.assertTrue(helper3.exists())

    def test_autojoin_eval_necessity(self):
        self.assertTrue(
            self.env["res.partner"]._fields["user_ids"].auto_join,
            "res.partner.user_ids is no longer autojoin, change the test",
        )

        normal_domain = [("id", "=", self.env.ref("base.main_partner").id)]
        autojoin_domain = [("user_ids.login", "=", "admin")]
        merged_domain = expression.OR([normal_domain, autojoin_domain])

        search = self.env["res.partner"].search
        self.assertNotEqual(
            search(normal_domain) | search(autojoin_domain),
            search(merged_domain),
            "Searching autojoined fields is not buggy, is the workaround "
            "still needed?",
        )

        helper = self._create_filter(domain=autojoin_domain)
        main = self._create_filter(domain=normal_domain, unions=helper)
        self.assertEqual(
            main._evaluate(), search(normal_domain) | search(autojoin_domain)
        )

    def test_2many_eval_necessity(self):
        category = self.env.ref("base.res_partner_category_14")
        domain = [("category_id.name", "=", category.name)]
        search = self.env["res.partner"].search
        self.assertTrue(
            search(domain) & search(["!"] + domain),
            "Negating across 2many relations is not buggy, is the workaround "
            "still needed?",
        )

        helper = self._create_filter(domain=domain)
        main = self._create_filter(domain=domain, complements=helper)
        self.assertFalse(main._evaluate())

    def _create_filter(self, unions=(), complements=(), **vals):
        vals.setdefault("model_id", "res.partner")
        vals.setdefault("name", str(uuid.uuid4()))
        vals.setdefault("domain", "[(1, '=', 1)]")
        vals.setdefault(
            "union_filter_ids", [(6, 0, [rec.id for rec in unions])]
        )
        vals.setdefault(
            "complement_filter_ids", [(6, 0, [rec.id for rec in complements])]
        )
        return self.env["ir.filters"].create(vals)

    def _combine(self, action, domain, *, model="res.partner"):
        """run the combination wizard with some default values"""
        self.env['ir.filters.combine.with.existing'].create({
            'action': action,
            'domain': json.dumps(domain),
            'model': model,
            'filter_id': self.test_filter.id
        }).button_save()

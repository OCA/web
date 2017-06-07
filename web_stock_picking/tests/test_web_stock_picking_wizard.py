# -*- coding: utf-8 -*-
# Copyright 2016 LasLabs Inc.
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from openerp.tests.common import TransactionCase


class TestWebsiteStockPickingWizard(TransactionCase):

    def setUp(self):
        super(TestWebsiteStockPickingWizard, self).setUp()
        self.Model = self.env['website.stock.picking.wizard']
        self.picking_id = self.env['stock.picking'].browse(1)

    def new_record(self, query=None):
        if query is None:
            query = self.picking_id.name
        return self.Model.create({
            'search_query': query,
            'picking_type': 'incoming',
            'picking_state': 'confirmed',
        })

    def test_get_domain(self):
        """ It should return proper domain w/ all args """
        expect = self.picking_id.name
        rec_id = self.new_record(expect)
        res = rec_id._get_domain()
        expect = [
            ('company_id', '=', self.env.user.company_id.id),
            ('name', '=', expect),
            ('picking_type_id.code', '=', 'incoming'),
            ('state', '=', u'confirmed'),
        ]
        self.assertEqual(
            expect, res,
        )

    # def test_create_and_action_search(self):
    #     """ It should call action_search on create and fill pickings """
    #     rec_id = self.new_record()
    #     self.assertEqual(
    #         self.picking_id, rec_id.picking_ids,
    #     )

    # def test_action_search(self):
    #     """ It should fill pickings
    #     This seems like a dup test, but is helpful to diagnose issue
    #     in create
    #     """
    #     rec_id = self.new_record()
    #     rec_id.action_search()
    #     self.assertEqual(
    #         self.picking_id, rec_id.picking_ids,
    #     )

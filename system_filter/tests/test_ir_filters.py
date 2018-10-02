# -*- coding: utf-8 -*-
# Copyright 2018 ACSONE SA/NV (<http://acsone.eu>)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
from uuid import uuid4
from odoo.tests.common import TransactionCase


class IrFiltersTest(TransactionCase):
    """
    Tests for ir.filters
    """

    def setUp(self):
        super(IrFiltersTest, self).setUp()
        self.filter_obj = self.env['ir.filters']
        self.res_users_model = self.env.ref("base.model_res_users")
        # Create basic filters
        self.filter_system = self.filter_obj.create({
            'name': str(uuid4()),
            'active': True,
            'model_id': self.res_users_model.model,
            'domain': [],
            'sort': [],
            'context': {},
            'is_system': True,
        })
        self.filter_normal = self.filter_obj.create({
            'name': str(uuid4()),
            'active': True,
            'model_id': self.res_users_model.model,
            'domain': [],
            'sort': [],
            'context': {},
            'is_system': False,
        })
        self.filter_inactive = self.filter_obj.create({
            'name': str(uuid4()),
            'active': False,
            'model_id': self.res_users_model.model,
            'domain': [],
            'sort': [],
            'context': {},
            'is_system': False,
        })
        self.filters = self.filter_inactive | self.filter_normal |\
            self.filter_system

    def test_get_filters_system(self):
        """
        Test the function get_filters.
        Expected behaviour:
        - Returned filters must have is_system to False
        :return:
        """
        filters_result = self.filter_obj.get_filters(
            self.res_users_model.model)
        filter_ids = [r.get('id') for r in filters_result if r.get('id')]
        filters = self.filter_obj.browse(filter_ids)
        # Based on data from setUp, we should have filters in different states:
        # active, inactive, is_system (False and True)
        self.assertFalse(any(filters.mapped("is_system")))

        # Now disable every filters from the setUp
        self.filters.write({
            'active': False,
        })
        filters_result = self.filter_obj.get_filters(
            self.res_users_model.model)
        filter_ids = [r.get('id') for r in filters_result if r.get('id')]
        filters = self.filter_obj.browse(filter_ids)
        self.assertFalse(any(filters.mapped("is_system")))

        # Disable every filters related to a model
        # To test the case when we don't have any results
        domain = [('model_id', '=', self.res_users_model.id)]
        self.filter_obj.search(domain).write({
            'active': False,
        })
        filters_result = self.filter_obj.get_filters(
            self.res_users_model.model)
        filter_ids = [r.get('id') for r in filters_result if r.get('id')]
        filters = self.filter_obj.browse(filter_ids)
        self.assertFalse(any(filters.mapped("is_system")))

        # Re-active them
        self.filters.write({
            'active': True,
        })
        filters_result = self.filter_obj.get_filters(
            self.res_users_model.model)
        filter_ids = [r.get('id') for r in filters_result if r.get('id')]
        filters = self.filter_obj.browse(filter_ids)
        self.assertFalse(any(filters.mapped("is_system")))

        # Set is_system to True for these filters
        self.filters.write({
            'active': True,
        })
        filters_result = self.filter_obj.get_filters(
            self.res_users_model.model)
        filter_ids = [r.get('id') for r in filters_result if r.get('id')]
        filters = self.filter_obj.browse(filter_ids)
        self.assertFalse(any(filters.mapped("is_system")))
        return

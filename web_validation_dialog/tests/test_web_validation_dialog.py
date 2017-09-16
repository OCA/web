# -*- coding: utf-8 -*-
# See LICENSE file for full copyright and licensing details.

from odoo.tests import common


class TestWebValidationDialog(common.TransactionCase):

    def setUp(self):
        super(TestWebValidationDialog, self).setUp()
        self.company = self.env.ref('base.main_company')
        self.company.security_key = 'pwd'

    def test_check_security(self):
        res = self.company.check_security({
            'companyId': self.company.id,
            'password': 'pwd',
            'field': 'security_key',
        })
        self.assertTrue(res,
                        'Invalid or Wrong Password! Contact your '
                        'Administrator.')

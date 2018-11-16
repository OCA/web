# -*- coding: utf-8 -*-
# © 2017 Serpent Consulting Services Pvt. Ltd. (http://www.serpentcs.com)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
from odoo.tests import common


class TestWebValidationDialog(common.TransactionCase):

    def setUp(self):
        super(TestWebValidationDialog, self).setUp()
        self.company = self.env.ref('base.main_company')
        self.company.security_code = 'pwd'

    def test_check_security(self):
        res = self.company.check_security({
            'companyId': self.company.id,
            'password': 'pwd',
            'field': 'security_code',
        })
        self.assertTrue(res)

    def test_invalid_check_security(self):
        self.company.security_code = '12345'
        res = self.company.check_security({
            'companyId': self.company.id,
            'password': '123',
            'field': 'security_code',
        })
        self.assertFalse(
            res, 'Invalid or Wrong Password! Contact your Administrator.')

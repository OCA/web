# Copyright 2023 Sunflower IT
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

from odoo.tests.common import TransactionCase
from odoo.exceptions import AccessError


class TestSupportBranding(TransactionCase):
    def setUp(self):
        super(TestSupportBranding, self).setUp()
        self.company_obj = self.env['res.company']
        self.ir_config_obj = self.env['ir.config_parameter'].sudo()
        self.demo_user = self.env.ref('base.user_demo')
        self.admin_user = self.env.ref('base.user_admin')
        self.demo_support_branding_company_name = self.env.ref(
            'support_branding.demo_config_parameter_company_name')
        self.demo_support_company_branding_url = self.env.ref(
            'support_branding.demo_config_parameter_company_url')

    def test_fetch_support_branding_vals_from_res_company(self):

        # Check if demo user is able to access.
        # NB: ir.config_parameter model requires admin access rights.
        with self.assertRaises(AccessError):
            self.ir_config_obj.with_user(self.demo_user).get_param(
                self.demo_support_company_branding_url.key)

        value = self.company_obj.with_user(self.demo_user) \
            .get_ir_config_param_data(
            self.demo_support_company_branding_url.key)

        self.assertEquals(value, self.demo_support_company_branding_url.value)

        # Check if admin user is able to access
        # admin has access all through
        value_1 = self.company_obj.with_user(self.admin_user) \
            .get_ir_config_param_data(
            self.demo_support_company_branding_url.key)
        value_2 = self.company_obj.with_user(self.admin_user) \
            .get_ir_config_param_data(
            self.demo_support_company_branding_url.key)
        self.assertEquals(value_1, value_2)
        self.assertEquals(value_1, self.demo_support_company_branding_url.value)
        self.assertEquals(value_2, self.demo_support_company_branding_url.value)



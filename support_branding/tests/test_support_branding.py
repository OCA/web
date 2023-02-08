# Copyright 2023 Sunflower IT
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

from odoo.exceptions import AccessError
from odoo.tests.common import TransactionCase


class TestSupportBranding(TransactionCase):
    def setUp(self):
        super(TestSupportBranding, self).setUp()
        self.company_obj = self.env["res.company"]
        self.ir_config_obj = self.env["ir.config_parameter"].sudo()
        self.demo_user = self.env.ref("base.user_demo")
        self.admin_user = self.env.ref("base.user_admin")
        self.portal_user = self.env.ref("base.demo_user0")
        self.demo_support_branding_company_name = self.env.ref(
            "support_branding.demo_config_parameter_company_name"
        )
        self.demo_support_company_branding_url = self.env.ref(
            "support_branding.demo_config_parameter_company_url"
        )

    def test_fetch_support_branding_vals_from_res_company(self):

        # Check if user has the right access rights e.g. portal user not allowed
        with self.assertRaises(AccessError):
            self.ir_config_obj.with_user(self.portal_user).get_param(
                self.demo_support_branding_company_name.key
            )

        # Check if demo user is able to access.
        # NB: ir.config_parameter model requires admin access rights.
        with self.assertRaises(AccessError):
            self.ir_config_obj.with_user(self.demo_user).get_param(
                self.demo_support_branding_company_name.key
            )

        vals = self.company_obj.with_user(
            self.demo_user
        ).get_support_branding_config_param_data()

        self.assertEquals(
            vals["support_company"], self.demo_support_branding_company_name.value
        )

        # Check if admin user is able to access
        # admin has access all through
        vals_1 = self.company_obj.with_user(
            self.admin_user
        ).get_support_branding_config_param_data()
        vals_2 = self.company_obj.with_user(
            self.admin_user
        ).get_support_branding_config_param_data()
        self.assertEquals(vals_1, vals_2)
        self.assertEquals(
            vals_1["support_company_url"], self.demo_support_company_branding_url.value
        )
        self.assertEquals(
            vals_2["support_company_url"], self.demo_support_company_branding_url.value
        )

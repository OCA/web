# Copyright 2020 initOS GmbH.
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from odoo.addons.base.tests.common import BaseCommon


class TestIrConfigParameter(BaseCommon):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.env["ir.config_parameter"].set_int("web_m2x_options.limit", 10)
        cls.env["ir.config_parameter"].set_bool("web_m2x_options.create_edit", True)
        cls.env["ir.config_parameter"].set_bool("web_m2x_options.create", True)

    def test_web_m2x_options_key(self):
        web_m2x_options = self.env["ir.config_parameter"].get_web_m2x_options()
        self.assertIn("web_m2x_options.limit", web_m2x_options)

    def test_web_m2x_options_value(self):
        web_m2x_options = self.env["ir.config_parameter"].get_web_m2x_options()
        self.assertEqual(web_m2x_options["web_m2x_options.limit"], "10")
        self.assertTrue(bool(web_m2x_options["web_m2x_options.create_edit"]))
        self.assertTrue(bool(web_m2x_options["web_m2x_options.create"]))

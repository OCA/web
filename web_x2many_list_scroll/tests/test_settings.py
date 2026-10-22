# Copyright 2026 Jarsa
# License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl).
from odoo.tests.common import TransactionCase


class TestSettings(TransactionCase):
    def test_the_setting_reaches_the_session(self):
        http = self.env["ir.http"]
        self.assertEqual(http._web_x2many_list_scroll_rows(), 0, "off until set")
        settings = self.env["res.config.settings"].create(
            {"web_x2many_list_scroll_rows": 12}
        )
        settings.execute()
        self.assertEqual(http._web_x2many_list_scroll_rows(), 12)
        self.env["ir.config_parameter"].sudo().set_param(
            "web_x2many_list_scroll.rows", "-3"
        )
        self.assertEqual(
            http._web_x2many_list_scroll_rows(), 0, "a negative value is off"
        )
        self.env["ir.config_parameter"].sudo().set_param(
            "web_x2many_list_scroll.rows", "many"
        )
        self.assertEqual(http._web_x2many_list_scroll_rows(), 0, "garbage is off")

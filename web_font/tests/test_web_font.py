# Copyright 2026 Ecosoft Co., Ltd. (https://ecosoft.co.th)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

import json

from odoo.exceptions import ValidationError
from odoo.tests import HttpCase, TransactionCase, tagged

from odoo.addons.web.tests.test_js import unit_test_error_checker


class TestWebFont(TransactionCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.Settings = cls.env["res.config.settings"]
        cls.ICP = cls.env["ir.config_parameter"].sudo()
        cls.IrHttp = cls.env["ir.http"]

    def test_01_no_font(self):
        self.ICP.set_str("web_font.font", False)
        self.assertFalse(self.IrHttp._get_web_font_info())

    def test_02_selection_from_company_font(self):
        self.assertEqual(
            self.Settings._get_web_font_selection(),
            self.env["res.company"]._fields["font"]._description_selection(self.env),
        )

    def test_03_set_font(self):
        self.Settings.create({"web_font": "Roboto"}).execute()
        info = self.IrHttp._get_web_font_info()
        self.assertEqual(info["family"], "Roboto")
        self.assertEqual(info["size"], 0)
        # @font-face taken from the report assets, only for the chosen font
        regular = [f for f in info["faces"] if "Roboto-Regular.ttf" in f["src"]]
        self.assertEqual(len(regular), 1)
        self.assertEqual(regular[0]["weight"], "400")
        self.assertEqual(regular[0]["style"], "normal")
        self.assertFalse([f for f in info["faces"] if "Roboto/" not in f["src"]])

    def test_04_font_size(self):
        self.Settings.create({"web_font": "Roboto", "web_font_size": 120}).execute()
        self.assertEqual(self.IrHttp._get_web_font_info()["size"], 120)
        with self.assertRaises(ValidationError):
            self.Settings.create({"web_font_size": 300})

    def test_05_ignore_unknown_font(self):
        """Values written directly in system parameters are not trusted"""
        self.ICP.set_str("web_font.font", "x</style><script>")
        self.assertFalse(self.IrHttp._get_web_font_info())


@tagged("post_install", "-at_install")
class TestWebFontHttp(HttpCase):
    def test_session_info(self):
        self.env["ir.config_parameter"].sudo().set_str("web_font.font", "Roboto")
        self.authenticate("admin", "admin")
        res = self.url_open("/odoo")
        session_info = res.text.split("odoo.__session_info__ = ", 1)[1]
        session_info = json.JSONDecoder().raw_decode(session_info)[0]
        self.assertEqual(session_info["web_font"]["family"], "Roboto")

    def test_js(self):
        self.browser_js(
            "/web/tests?headless&loglevel=2&preset=desktop&timeout=15000"
            "&filter=%22%40web_font%2F%22",
            "",
            "",
            login="admin",
            timeout=1800,
            success_signal="[HOOT] Test suite succeeded",
            error_checker=unit_test_error_checker,
        )

# Copyright 2026 ForgeFlow S.L. (https://www.forgeflow.com)
# License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl.html).
import json

from odoo.tests.common import HttpCase, tagged


@tagged("post_install", "-at_install")
class TestWebLoadingBlockUI(HttpCase):
    def _get_session_info(self):
        response = self.url_open(
            "/web/session/get_session_info",
            data=json.dumps({"jsonrpc": "2.0", "method": "call", "params": {}}),
            headers={"Content-Type": "application/json"},
        )
        return response.json()["result"]

    def test_session_info_default_delay(self):
        self.authenticate("admin", "admin")
        self.assertEqual(self._get_session_info()["web_loading_block_ui_delay"], "3000")

    def test_session_info_custom_delay(self):
        self.env["ir.config_parameter"].sudo().set_param(
            "web_loading_block_ui.delay", "0"
        )
        self.authenticate("admin", "admin")
        self.assertEqual(self._get_session_info()["web_loading_block_ui_delay"], "0")

    def test_js(self):
        self.browser_js(
            "/web/tests?headless&loglevel=2&preset=desktop&filter=WebLoadingBlockUI",
            "",
            "",
            login="admin",
            success_signal="[HOOT] Test suite succeeded",
            error_checker=lambda x: "[HOOT]" not in x,
        )

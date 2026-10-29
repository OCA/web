# Copyright 2026 glueckkanja AG
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

import json

from odoo.tests.common import HttpCase, TransactionCase, tagged


@tagged("post_install", "-at_install")
class TestMany2oneColorMixin(TransactionCase):
    def test_color_models(self):
        """Only concrete models inheriting the mixin are reported."""
        models = self.env["many2one.color.mixin"]._get_many2one_color_models()
        self.assertNotIn("many2one.color.mixin", models)
        for name in models:
            self.assertFalse(self.env[name]._abstract)
            self.assertIn("many2one_color", self.env[name]._fields)


@tagged("post_install", "-at_install")
class TestSessionInfo(HttpCase):
    def test_session_info_lists_color_models(self):
        """The web client learns which models provide a color state."""
        self.authenticate("admin", "admin")
        response = self.url_open(
            "/web/session/get_session_info",
            data=json.dumps({"jsonrpc": "2.0", "method": "call", "params": {}}),
            headers={"Content-Type": "application/json"},
        )
        response.raise_for_status()
        session_info = response.json()["result"]
        self.assertIsInstance(session_info["many2one_color_models"], list)
        self.assertEqual(
            session_info["many2one_color_models"],
            self.env["many2one.color.mixin"]._get_many2one_color_models(),
        )

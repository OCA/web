# Copyright 2026 volkantasci
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

from odoo.tests.common import HttpCase, TransactionCase


class TestAppsMenuTheme(TransactionCase):
    def test_selection_includes_focus(self):
        selection = self.env["res.users"].fields_get(["apps_menu_theme"])[
            "apps_menu_theme"
        ]["selection"]
        keys = [key for key, _label in selection]
        self.assertIn("focus", keys)

    def test_user_can_be_set_to_focus(self):
        user = self.env["res.users"].create(
            {
                "name": "Focus Theme Test",
                "login": "focus_theme_test",
                "apps_menu_theme": "focus",
            }
        )
        self.assertEqual(user.apps_menu_theme, "focus")


class TestWebclientAssetBundle(HttpCase):
    def test_webclient_bootstrap_renders(self):
        self.authenticate("admin", "admin")
        response = self.url_open("/odoo")
        self.assertEqual(response.status_code, 200, response.text[:500])

# Copyright 2026 volkantasci
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

import json

from odoo import Command
from odoo.tests import HttpCase, TransactionCase, tagged


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

    def test_dark_bundle_registers_focus_assets(self):
        """The focus dark SCSS files must be part of web.assets_web_dark."""
        asset_paths = self.env["ir.asset"]._get_asset_paths(
            "web.assets_web_dark", self.env["ir.asset"]._get_asset_params()
        )
        paths = [path for path, *_rest in asset_paths]
        self.assertIn("/web_theme_focus/static/src/scss/apps_menu.dark.scss", paths)
        self.assertIn("/web_theme_focus/static/src/scss/navbar.dark.scss", paths)


@tagged("-at_install", "post_install")
class TestWebclientAssetBundle(HttpCase):
    def test_webclient_bootstrap_renders(self):
        self.authenticate("admin", "admin")
        response = self.url_open("/odoo")
        self.assertEqual(response.status_code, 200, response.text[:500])


@tagged("-at_install", "post_install")
class TestSessionInfoTheme(HttpCase):
    def test_session_info_reports_focus_theme(self):
        self.env["res.users"].create(
            {
                "name": "Focus Theme Session",
                "login": "focus_theme_session",
                "password": "focus_theme_session",
                "group_ids": [Command.link(self.env.ref("base.group_user").id)],
                "apps_menu_theme": "focus",
            }
        )
        self.authenticate("focus_theme_session", "focus_theme_session")
        response = self.url_open("/web")
        self.assertEqual(response.status_code, 200, response.text[:500])
        session_info = None
        key = "odoo.__session_info__ = "
        for line in response.text.splitlines():
            if key in line:
                session_info = json.loads(line.split(key, 1)[1].rstrip(";"))
                break
        self.assertIsNotNone(session_info, "session info not found in /web page")
        self.assertEqual(session_info["apps_menu"]["theme"], "focus")

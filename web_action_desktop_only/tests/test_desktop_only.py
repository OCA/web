# Copyright 2026 Heligrafics
# License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl).

import logging

from odoo.tests import TransactionCase

LOG = logging.getLogger(__name__)


class TestDesktopOnly(TransactionCase):
    """Tests for the web_action_desktop_only module."""

    def setUp(self):
        super().setUp()
        self.action = self.env["ir.actions.act_window"].create(
            {
                "name": "Test Action",
                "res_model": "res.partner",
                "view_mode": "list,form",
            }
        )
        self.root_menu = self.env["ir.ui.menu"].create(
            {
                "name": "Test App",
            }
        )
        self.child_menu = self.env["ir.ui.menu"].create(
            {
                "name": "Test Child",
                "parent_id": self.root_menu.id,
                "action": f"ir.actions.act_window,{self.action.id}",
            }
        )

    def test_desktop_only_default_false(self):
        """Check that desktop_only defaults to False."""

        self.assertFalse(self.action.desktop_only)

    def test_main_action_default_false(self):
        """Check that main_action defaults to False."""

        self.assertFalse(self.action.main_action)

    def test_load_web_menus_includes_desktop_only(self):
        """Check that load_web_menus exposes desktopOnly in the payload."""

        self.action.desktop_only = True
        menus = self.env["ir.ui.menu"].load_web_menus(False)

        child_menu_data = menus.get(self.child_menu.id)

        self.assertIsNotNone(child_menu_data)
        self.assertTrue(child_menu_data.get("desktopOnly"))

    def test_load_web_menus_includes_main_action(self):
        """Check that load_web_menus exposes mainAction in the payload."""

        self.action.main_action = True
        menus = self.env["ir.ui.menu"].load_web_menus(False)

        child_menu_data = menus.get(self.child_menu.id)

        self.assertIsNotNone(child_menu_data)
        self.assertTrue(child_menu_data.get("mainAction"))

    def test_load_web_menus_no_flags_by_default(self):
        """Check that without flags the values are False or absent."""

        menus = self.env["ir.ui.menu"].load_web_menus(False)

        child_menu_data = menus.get(self.child_menu.id)

        self.assertIsNotNone(child_menu_data)
        self.assertFalse(child_menu_data.get("desktopOnly"))
        self.assertFalse(child_menu_data.get("mainAction"))

    def test_enrich_menus_with_empty_payload(self):
        """Check that _enrich_menus_with_action_flags handles an empty payload."""

        empty_menus = {}
        self.env["ir.ui.menu"]._enrich_menus_with_action_flags(empty_menus)

        self.assertEqual(empty_menus, {})

    def test_enrich_menus_skips_menus_without_action(self):
        """Check that menus without actionID are not enriched."""

        payload = {1: {"actionID": None, "actionModel": None, "children": []}}
        self.env["ir.ui.menu"]._enrich_menus_with_action_flags(payload)

        self.assertNotIn("desktopOnly", payload[1])
        self.assertNotIn("mainAction", payload[1])

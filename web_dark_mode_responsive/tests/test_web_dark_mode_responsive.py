# Copyright 2026 Domatix
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

from odoo.tests import TransactionCase, tagged


@tagged("post_install", "-at_install")
class TestWebDarkModeResponsive(TransactionCase):
    def test_module_and_dependencies_installed(self):
        for name in (
            "web_dark_mode",
            "web_responsive",
            "web_dark_mode_responsive",
        ):
            module = self.env["ir.module.module"].search([("name", "=", name)])
            self.assertTrue(module, f"Module {name} should exist")
            self.assertEqual(
                module.state,
                "installed",
                f"Module {name} should be installed",
            )

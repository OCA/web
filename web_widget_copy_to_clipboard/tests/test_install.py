# License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl).
from odoo.tests.common import TransactionCase


class TestInstall(TransactionCase):
    def test_module_installed(self):
        module = self.env["ir.module.module"].search(
            [("name", "=", "web_widget_copy_to_clipboard"), ("state", "=", "installed")]
        )
        self.assertTrue(module, "The module should be installed")

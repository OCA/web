# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).
from odoo.tests.common import TransactionCase, tagged


@tagged("post_install", "-at_install")
class TestModule(TransactionCase):
    def test_module_installed(self):
        module = self.env["ir.module.module"].search(
            [("name", "=", "web_timeline_gantt_ux")]
        )
        self.assertTrue(module)
        self.assertEqual(module.state, "installed")

    def test_backend_assets_registered(self):
        # The asset definitions must survive a manifest typo: resolving the
        # backend bundle must include this addon's files.
        bundle = self.env["ir.asset"]._get_asset_paths("web.assets_backend", {})
        paths = [entry[0] for entry in bundle]
        self.assertTrue(
            any("web_timeline_gantt_ux" in path for path in paths),
            "web_timeline_gantt_ux assets missing from web.assets_backend",
        )

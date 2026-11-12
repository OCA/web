# License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl.html).

from odoo.tests import HttpCase, tagged


@tagged("post_install", "-at_install")
class TestRememberTreeColumnWidth(HttpCase):
    def test_js(self):
        self.browser_js(
            "/web/tests?headless&loglevel=2&preset=desktop&timeout=15000"
            "&filter=web_remember_tree_column_width",
            "",
            "",
            login="admin",
            timeout=180,
            success_signal="[HOOT] Test suite succeeded",
            error_checker=lambda message: "[HOOT]" not in message,
        )

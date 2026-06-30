# Copyright 2025 ForgeFlow S.L.
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

from odoo.tests import HttpCase, tagged


@tagged("post_install", "-at_install")
class TestHtmlTranslationDialogUI(HttpCase):
    def test_html_translation_dialog_ui(self):
        """Run the dialog's web unit (hoot) tests through a headless browser."""
        self.browser_js(
            "/web/tests?headless&loglevel=2&preset=desktop"
            "&timeout=15000&filter=per-language",
            "",
            "",
            login="admin",
            timeout=900,
            success_signal="[HOOT] Test suite succeeded",
        )

# Copyright 2026 Yves Goldberg (Ygol InternetWork)
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
from odoo.tests import HttpCase, tagged

from odoo.addons.web.tests.test_js import qunit_error_checker


@tagged("post_install", "-at_install")
class TestPasteMarkdownQUnit(HttpCase):
    """Run the QUnit suite of the module in a headless browser."""

    def test_qunit_suite(self):
        """The QUnit suite of the module passes."""
        self.browser_js(
            "/web/tests?module=web_editor_paste_markdown",
            "",
            "",
            login="admin",
            timeout=600,
            error_checker=qunit_error_checker,
        )

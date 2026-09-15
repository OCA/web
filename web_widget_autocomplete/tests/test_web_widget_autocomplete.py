# Copyright 2026 Cetmix OÜ
# License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl-3.0).

from odoo.tests import HttpCase, tagged


@tagged("post_install", "-at_install")
class TestWebWidgetAutocompleteHoot(HttpCase):
    def test_js(self):
        # Regex (not a fuzzy text filter): HOOT otherwise matches this
        # suite from other WebWidget* filters such as WebWidgetPattern.
        self.browser_js(
            "/web/tests?headless&loglevel=2&preset=desktop"
            "&filter=/web_widget_autocomplete/",
            "",
            "",
            login="admin",
            success_signal="[HOOT] Test suite succeeded",
            error_checker=lambda x: "[HOOT]" not in x,
        )

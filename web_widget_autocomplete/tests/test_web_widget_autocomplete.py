# Copyright 2026 Cetmix OÜ
# License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl-3.0).

import odoo

from odoo.addons.web.tests.test_js import WebSuite


@odoo.tests.tagged("post_install", "-at_install")
class TestWebWidgetAutocompleteHoot(WebSuite):
    def get_hoot_filters(self):
        self._test_params = [("+", "@web_widget_autocomplete")]
        return super().get_hoot_filters()

    def test_web_widget_autocomplete(self):
        self.test_unit_desktop()

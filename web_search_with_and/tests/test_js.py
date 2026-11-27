# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl.html).

from odoo.tests import HttpCase, tagged

from odoo.addons.web.tests.test_js import unit_test_error_checker


@tagged("post_install", "-at_install")
class TestHoot(HttpCase):
    def test_hoot_web_search_with_and(self):
        self.browser_js(
            "/web/tests?headless&loglevel=2&preset=desktop&timeout=15000"
            "&filter=web_search_with_and",
            "",
            "",
            login="admin",
            timeout=600,
            success_signal="[HOOT] Test suite succeeded",
            error_checker=unit_test_error_checker,
        )

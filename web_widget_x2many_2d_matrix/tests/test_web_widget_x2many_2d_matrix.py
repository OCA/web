from odoo.tests import HttpCase, tagged


@tagged("post_install", "-at_install")
class TestWebWidgetX2Many2DMatrix(HttpCase):
    def test_js(self):
        self.browser_js(
            "/web/tests?headless&loglevel=2&preset=desktop&timeout=15000&id=b42fa5f8",
            "",
            "",
            login="admin",
            timeout=1800,
            success_signal="[HOOT] Test suite succeeded",
            error_checker=lambda x: "[HOOT]" not in x,
        )

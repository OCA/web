import odoo

from odoo.addons.web.tests.test_js import WebSuite


@odoo.tests.tagged("post_install", "-at_install")
class TestJs(WebSuite):
    def get_hoot_filters(self):
        self._test_params = [("+", "@web_chat_separate_group")]
        return super().get_hoot_filters()

    def test_web_chat(self):
        self.test_unit_desktop()

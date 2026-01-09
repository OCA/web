# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).
import odoo.tests


@odoo.tests.tagged("post_install", "-at_install")
class TestTours(odoo.tests.HttpCase):
    def test_disable_chatgpt(self):
        self.start_tour(
            "/odoo/res.partner/3", "html_editor_disable_chatgpt_tour", login="admin"
        )

from odoo.tests.common import HttpCase, tagged


@tagged("-at_install", "post_install")
class TestWebIrActionsActWindowPage(HttpCase):
    def test_tour(self):
        self.start_tour(
            "/odoo/web_ir_actions_act_window_page_demo",
            "web_ir_actions_act_window_page",
            login="admin",
        )

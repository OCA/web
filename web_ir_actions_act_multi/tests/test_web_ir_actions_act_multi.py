from odoo.tests.common import HttpCase, tagged
from odoo.tools import convert_file


@tagged("-at_install", "post_install")
class TestWebIrActionsActMultiTour(HttpCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        convert_file(
            cls.env,
            "web_ir_actions_act_multi",
            "demo/ir_actions_act_multi_demo.xml",
            {},
            mode="init",
        )
        # the form needs an email to be saved before the button's action runs
        cls.env.ref("base.partner_admin").email = "admin@example.com"

    def test_tour(self):
        self.start_tour(
            "/odoo/web_ir_actions_act_multi_demo",
            "web_ir_actions_act_multi",
            login="admin",
        )

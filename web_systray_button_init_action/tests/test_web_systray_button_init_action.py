# Copyright 2024 Tecnativa - Carlos Roca
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html)

from odoo.tests import common, tagged


@tagged("post_install", "-at_install")
class TestUI(common.HttpCase):
    def test_ui(self):
        admin = self.env.ref("base.user_admin")
        admin.action_id = False
        # Action not set
        self.start_tour(
            "/web",
            "web_systray_button_init_action_not_set_tour",
            login="admin",
            step_delay=100,
        )
        admin.action_id = self.env.ref("base.open_module_tree").id
        self.start_tour(
            "/web",
            "web_systray_button_init_action_set_tour",
            login="admin",
            step_delay=100,
        )

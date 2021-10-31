# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).
# Copyright 2020 Tecnativa - João Marques
import odoo.tests


@odoo.tests.tagged("post_install", "-at_install")
class TestTour(odoo.tests.HttpCase):
    def test_admin(self):
        self.start_tour("/web", "export_tour_admin", login="admin")

    def test_demo(self):
        self.start_tour("/web", "export_tour_demo", login="demo")

    def test_demo_xlsx(self):
        user = self.env.ref("base.user_demo")
        user.write(
            {
                "groups_id": [
                    (
                        4,
                        self.env.ref(
                            "web_disable_export_group.group_export_xlsx_data"
                        ).id,
                    )
                ]
            }
        )
        user.flush()
        self.start_tour("/web", "export_tour_demo_xlsx", login="demo")

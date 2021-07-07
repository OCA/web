# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).
# Copyright 2020 Tecnativa - João Marques
import odoo.tests


@odoo.tests.tagged("post_install", "-at_install")
class TestTour(odoo.tests.HttpCase):
    def setUp(self):
        super().setUp()
        self.env["res.users"].create(
            {
                "name": "user_not_export",
                "login": "user_not_export",
                "password": "user_not_export",
                "groups_id": [
                    (
                        6,
                        0,
                        [
                            self.env.ref("base.group_user").id,
                            self.env.ref("base.group_system").id,
                        ],
                    )
                ],
            }
        )

    def test_admin(self):
        self.start_tour("/web", "export_tour_admin", login="admin")

    def test_user_not_export(self):
        self.start_tour("/web", "export_tour_demo", login="user_not_export")

# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).
# Copyright 2020 Tecnativa - João Marques
# Copyright 2022 Tecnativa - Víctor Martínez
import odoo.tests
from odoo.tests import new_test_user


@odoo.tests.tagged("post_install", "-at_install")
class TestTour(odoo.tests.HttpCase):
    def setUp(self):
        super().setUp()
        new_test_user(
            self.env,
            login="user_not_export",
            password="user_not_export",
            groups="base.group_user,base.group_system",
        )
        new_test_user(
            self.env,
            login="user_export_xlsx",
            password="user_export_xlsx",
            groups=(
                "base.group_user,base.group_system,"
                "web_disable_export_group.group_export_xlsx_data"
            ),
        )

    def test_admin(self):
        self.start_tour("/web", "export_tour_xlsx_button_ok", login="admin")

    def test_user_not_export(self):
        self.start_tour("/web", "export_tour_xlsx_button_ko", login="user_not_export")

    def test_user_export_xlsx(self):
        self.start_tour("/web", "export_tour_xlsx_button_ok", login="user_export_xlsx")

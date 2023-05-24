# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).
# Copyright 2020 Xtendoo - Daniel Domínguez
import odoo.tests


@odoo.tests.tagged("post_install", "-at_install")
class TestTour(odoo.tests.HttpCase):
    def test_admin(self):
        self.start_tour("/web", "archive_tour_admin", login="admin")

    def test_demo(self):
        self.start_tour("/web", "archive_tour_demo", login="demo")

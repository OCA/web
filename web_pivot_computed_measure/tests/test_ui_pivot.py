# Copyright 2022 Tecnativa - Carlos Roca
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html)


from odoo.tests import common, tagged


@tagged("post_install", "-at_install")
class TestUIPivot(common.HttpCase):
    @classmethod
    def setUpClass(cls):
        res = super().setUpClass()
        return res

    def test_ui(self):
        self.start_tour(
            "/odoo",
            "web_pivot_computed_measure_tour",
            login="admin",
            step_delay=100,
        )

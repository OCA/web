# Copyright 2022 Tecnativa - Carlos Roca
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html)
from odoo_test_helper import FakeModelLoader

from odoo.tests import common, tagged


@tagged("post_install", "-at_install")
class TestUIPivot(common.HttpCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.loader = FakeModelLoader(cls.env, cls.__module__)
        cls.loader.backup_registry()
        from .res_users_fake import ResUsersFake

        cls.loader.update_registry((ResUsersFake,))
        cls.env["res.users"].create(
            {
                "name": "User 1",
                "login": "us_1",
                # Fake fields
                "user_year_born": 1998,
                "user_year_now": 2022,
            }
        )
        # Set pivot view to company action
        action = cls.env.ref("base.action_res_users")
        action.view_mode += ",pivot"

    def test_ui(self):
        self.start_tour(
            "/web",
            "web_pivot_computed_measure_tour",
            login="admin",
            step_delay=100,
        )

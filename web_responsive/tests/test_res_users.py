# Copyright 2023 Taras Shabaranskyi
# License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl.html).

from odoo.tests.common import TransactionCase


class TestResUsers(TransactionCase):
    def test_compute_redirect_home(self):
        record = self.env["res.users"].create(
            {
                "action_id": False,
                "is_redirect_home": False,
                "name": "Jeant",
                "login": "jeant@mail.com",
                "password": "jeant@mail.com",
            }
        )

        record._compute_redirect_home()
        self.assertFalse(record.is_redirect_home)

        action_obj = self.env["ir.actions.actions"]
        record.action_id = action_obj.create(
            {"name": "Test Action", "type": "ir.actions.act_window"}
        )
        record._compute_redirect_home()
        self.assertFalse(record.is_redirect_home)

        record.action_id = False
        record.is_redirect_home = True
        record._compute_redirect_home()
        self.assertTrue(record.is_redirect_home)

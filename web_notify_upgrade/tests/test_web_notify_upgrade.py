# Copyright 2026 Akretion
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

from unittest.mock import patch

from odoo.tests.common import TransactionCase


class TestWebNotifyUpgrade(TransactionCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.user_online = cls.env["res.users"].create(
            {
                "name": "Test Online User",
                "login": "test_online_user",
                "email": "online@example.com",
            }
        )
        cls.user_busy = cls.env["res.users"].create(
            {
                "name": "Test Busy User",
                "login": "test_busy_user",
                "email": "busy@example.com",
                "manual_im_status": "busy",
            }
        )

    def test_get_upgrade_notification_params(self):
        params = self.env["ir.model.data"]._get_upgrade_notification_params()
        self.assertIn("message", params)
        self.assertIn("title", params)
        self.assertTrue(params.get("sticky"))

    def test_get_active_users_to_notify_of_upgrade(self):
        # Set up mail presence records
        self.env["mail.presence"].search(
            [("user_id", "in", (self.user_online.id, self.user_busy.id))]
        ).unlink()

        self.env["mail.presence"].create(
            {
                "user_id": self.user_online.id,
                "status": "online",
            }
        )
        self.env["mail.presence"].create(
            {
                "user_id": self.user_busy.id,
                "status": "online",
            }
        )

        active_users = self.env[
            "ir.model.data"
        ]._get_active_users_to_notify_of_upgrade()
        self.assertIn(self.user_online, active_users)
        self.assertNotIn(self.user_busy, active_users)

    def test_notify_active_users_of_upgrade(self):
        # Case 1: No active users
        self.env["mail.presence"].search([]).unlink()
        with patch.object(type(self.env["res.users"]), "notify_info") as mock_notify:
            self.env["ir.model.data"]._notify_active_users_of_upgrade()
            mock_notify.assert_not_called()

        # Case 2: Active user present
        self.env["mail.presence"].create(
            {
                "user_id": self.user_online.id,
                "status": "online",
            }
        )
        with patch.object(type(self.env["res.users"]), "notify_info") as mock_notify:
            self.env["ir.model.data"]._notify_active_users_of_upgrade()
            mock_notify.assert_called_once()

    def test_process_end(self):
        with (
            patch.object(
                type(self.env["ir.model.data"]), "_notify_active_users_of_upgrade"
            ) as mock_notify,
            patch("odoo.addons.base.models.ir_model.IrModelData._process_end"),
        ):
            self.env["ir.model.data"]._process_end(["web_notify_upgrade"])
            mock_notify.assert_called_once()

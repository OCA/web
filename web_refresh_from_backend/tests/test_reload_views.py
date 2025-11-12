# Copyright 2025 Cetmix OÜ
# License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl).

from unittest.mock import patch

from odoo.tests import tagged
from odoo.tests.common import TransactionCase


@tagged("post_install", "-at_install")
class TestReloadViews(TransactionCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.user_admin = cls.env.ref("base.user_admin")
        cls.user_demo = cls.env.ref("base.user_demo")
        cls.partner = cls.env["res.partner"].create(
            {
                "name": "Test Partner",
            }
        )

    def test_reload_views_basic(self):
        """Test basic reload_views call without parameters"""
        with patch.object(type(self.env["bus.bus"]), "_sendmany") as mock_sendmany:
            self.user_admin.reload_views(model="res.partner")

            mock_sendmany.assert_called_once()
            # Get the notifications list - it's the first positional argument
            notifications = mock_sendmany.call_args[0][0]
            self.assertEqual(len(notifications), 1)

            partner, channel, message = notifications[0]
            self.assertEqual(partner, self.user_admin.partner_id)
            self.assertEqual(channel, "web.refresh_view")
            self.assertEqual(message["model"], "res.partner")
            self.assertEqual(message["view_types"], [])
            self.assertEqual(message["rec_ids"], [])

    def test_reload_views_with_params(self):
        """Test reload_views with view_types and rec_ids parameters"""
        with patch.object(type(self.env["bus.bus"]), "_sendmany") as mock_sendmany:
            self.user_admin.reload_views(
                model="res.partner",
                view_types=["form", "kanban"],
                rec_ids=[self.partner.id],
            )

            notifications = mock_sendmany.call_args[0][0]
            message = notifications[0][2]
            self.assertEqual(message["view_types"], ["form", "kanban"])
            self.assertEqual(message["rec_ids"], [self.partner.id])

    def test_reload_views_multiple_users(self):
        """Test reload_views for multiple users at once"""
        users = self.user_admin | self.user_demo

        with patch.object(type(self.env["bus.bus"]), "_sendmany") as mock_sendmany:
            users.reload_views(model="res.partner")

            notifications = mock_sendmany.call_args[0][0]
            self.assertEqual(len(notifications), 2)

            # Verify both users' partners are notified
            notified_partners = {n[0] for n in notifications}
            expected_partners = {self.user_admin.partner_id, self.user_demo.partner_id}
            self.assertEqual(notified_partners, expected_partners)

    def test_reload_views_recordset(self):
        """Test reload_views on a multi-record user recordset.

        Ensures that calling reload_views on a recordset still results in a
        single _sendmany call, with one notification entry per user.
        """
        users = self.user_admin | self.user_demo

        with patch.object(type(self.env["bus.bus"]), "_sendmany") as mock_sendmany:
            users.reload_views(model="res.partner")

            # _sendmany should be called only once for the whole recordset
            mock_sendmany.assert_called_once()

            notifications = mock_sendmany.call_args[0][0]
            # We expect one notification tuple per user in the recordset
            self.assertEqual(len(notifications), 2)

            # Verify both users' partners are notified and payload is correct
            for partner, channel, message in notifications:
                self.assertIn(
                    partner, {self.user_admin.partner_id, self.user_demo.partner_id}
                )
                self.assertEqual(channel, "web.refresh_view")
                self.assertEqual(message["model"], "res.partner")
                self.assertEqual(message["view_types"], [])
                self.assertEqual(message["rec_ids"], [])

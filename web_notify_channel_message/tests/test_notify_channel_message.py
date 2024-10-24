# Copyright 2023 ForgeFlow S.L. (https://www.forgeflow.com)
# License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl).

from odoo import api
from odoo.tests import common


class TestWebNotifyChannelMessage(common.SavepointCase):
    @classmethod
    def setUpClass(cls):
        super(TestWebNotifyChannelMessage, cls).setUpClass()
        cls.env.user = cls.env.ref("base.user_admin")
        cls.other_user = cls.env.ref("base.user_demo")
        cls.env = api.Environment(cls.cr, cls.env.user.id, {})
        cls.env.user.tz = False  # Make sure there's no timezone in user
        cls.user_internal = cls.env["res.users"].create(
            {
                "name": "Test Internal User",
                "login": "internal_user",
                "password": "internal_user",
                "email": "mark.brown23@example.com",
            }
        )
        cls.channel = cls.env["mail.channel"].create(
            {
                "name": "Test channel",
                "channel_partner_ids": [
                    (4, cls.env.user.partner_id.id),
                    (4, cls.user_internal.partner_id.id),
                ],
            }
        )

    def test_01_post_message_admin(self):
        initial_message = (
            self.env["mail.channel"]
            .search([("name", "=", "Test channel")], limit=1)
            .message_ids
        )
        self.assertEqual(len(initial_message), 0)
        self.channel.message_post(
            author_id=self.env.user.partner_id.id,
            body="Hello",
            message_type="notification",
            subtype_xmlid="mail.mt_comment",
        )
        message = (
            self.env["mail.channel"]
            .search([("name", "=", "Test channel")], limit=1)
            .message_ids[0]
        )
        self.assertEqual(len(message), 1)

    def test_02_post_message_non_admin(self):
        initial_message = (
            self.env["mail.channel"]
            .search([("name", "=", "Test channel")], limit=1)
            .message_ids
        )
        self.assertEqual(len(initial_message), 0)
        self.channel.with_user(self.other_user).message_post(
            author_id=self.other_user.partner_id.id,
            body="Hello",
            message_type="notification",
            subtype_xmlid="mail.mt_comment",
        )
        message = (
            self.env["mail.channel"]
            .search([("name", "=", "Test channel")], limit=1)
            .message_ids[0]
        )
        self.assertEqual(len(message), 1)

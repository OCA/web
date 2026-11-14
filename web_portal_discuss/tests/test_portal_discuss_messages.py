from odoo.exceptions import AccessError
from odoo.tests.common import TransactionCase


class TestPortalDiscussMessages(TransactionCase):
    """Test the portal Discuss membership policy."""

    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.portal_partner = cls.env["res.partner"].create(
            {
                "name": "Portal Discuss Member",
                "email": "portal-discuss-member@example.com",
            }
        )
        cls.portal_user = (
            cls.env["res.users"]
            .with_context(no_reset_password=True)
            .create(
                {
                    "name": cls.portal_partner.name,
                    "login": cls.portal_partner.email,
                    "partner_id": cls.portal_partner.id,
                    "share": True,
                    "groups_id": [(6, 0, [cls.env.ref("base.group_portal").id])],
                }
            )
        )
        cls.channel = cls.env["discuss.channel"].create(
            {
                "name": "Portal test channel",
            }
        )
        cls.other_channel = cls.env["discuss.channel"].create(
            {
                "name": "Other portal channel",
            }
        )
        cls.channel.sudo().add_members(
            partner_ids=[cls.portal_partner.id], post_joined_message=False
        )

    def test_portal_member_has_access(self):
        self.assertTrue(self.channel._portal_user_has_access(self.portal_user))
        self.assertEqual(
            self.channel._portal_check_access(self.portal_user), self.channel
        )

    def test_portal_non_member_has_no_access(self):
        self.assertFalse(self.other_channel._portal_user_has_access(self.portal_user))
        with self.assertRaises(AccessError):
            self.other_channel._portal_check_access(self.portal_user)

    def test_access_is_based_on_native_channel_membership(self):
        self.assertEqual(
            self.channel.channel_member_ids.filtered(
                lambda member: member.partner_id == self.portal_partner
            ).partner_id,
            self.portal_partner,
        )
        self.assertFalse(
            self.other_channel.channel_member_ids.filtered(
                lambda member: member.partner_id == self.portal_partner
            )
        )

    def test_messages_are_scoped_by_channel(self):
        first_message = self.channel.message_post(
            body="Message in the authorized channel",
            message_type="comment",
        )
        other_message = self.other_channel.message_post(
            body="Message in another channel",
            message_type="comment",
        )
        messages = (
            self.env["mail.message"]
            .sudo()
            .search(
                [
                    ("model", "=", "discuss.channel"),
                    ("res_id", "=", self.channel.id),
                ]
            )
        )
        self.assertIn(first_message, messages)
        self.assertNotIn(other_message, messages)

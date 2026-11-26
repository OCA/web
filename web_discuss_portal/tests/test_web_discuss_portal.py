# Copyright 2026 Vortex Dimensión Digital
# License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl).

from odoo.tests.common import HttpCase, tagged

from odoo.addons.web_discuss_portal.controllers.main import DiscussPortal


@tagged("post_install", "-at_install")
class TestWebDiscussPortal(HttpCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.password = "portal_user_pwd"
        cls.portal_user = cls.env["res.users"].create(
            {
                "name": "Portal Tester",
                "login": "portal_tester",
                "password": cls.password,
                "group_ids": [(6, 0, [cls.env.ref("base.group_portal").id])],
            }
        )
        cls.portal_partner = cls.portal_user.partner_id
        # A channel gets group_public_id = base.group_user by default, which
        # hides it from portal users. These fixtures pass False on purpose so
        # that visibility is decided by membership alone.
        cls.joined_channel = cls._create_channel("Joined Channel")
        cls.joined_channel.add_members(
            partner_ids=cls.portal_partner.ids, post_joined_message=False
        )
        # Reachable (no authorized group) but never joined.
        cls.other_channel = cls._create_channel("Other Channel")
        # Restricted to internal users, joined anyway.
        cls.internal_channel = cls.env["discuss.channel"].create(
            {
                "name": "Internal Channel",
                "channel_type": "channel",
                "group_public_id": cls.env.ref("base.group_user").id,
            }
        )
        cls.internal_channel.add_members(
            partner_ids=cls.portal_partner.ids, post_joined_message=False
        )

    @classmethod
    def _create_channel(cls, name):
        return cls.env["discuss.channel"].create(
            {"name": name, "channel_type": "channel", "group_public_id": False}
        )

    def _get_listed_channels(self):
        """Return the channels the controller lists for the portal user.

        The domain comes from the controller itself, so these assertions keep
        tracking what the page actually renders.
        """
        domain = DiscussPortal()._get_discuss_channel_domain()
        return self.env["discuss.channel"].with_user(self.portal_user).search(domain)

    def test_joined_channel_is_listed(self):
        self.assertIn(self.joined_channel, self._get_listed_channels())

    def test_channel_without_membership_is_not_listed(self):
        self.assertNotIn(self.other_channel, self._get_listed_channels())

    def test_channel_restricted_to_internal_users_is_not_listed(self):
        """Membership is not enough: the authorized group still applies."""
        self.assertNotIn(self.internal_channel, self._get_listed_channels())

    def test_sub_channels_are_not_listed(self):
        sub_channel = self.joined_channel._create_sub_channel(name="Thread")
        sub_channel.add_members(
            partner_ids=self.portal_partner.ids, post_joined_message=False
        )
        listed = self._get_listed_channels()
        self.assertIn(self.joined_channel, listed)
        self.assertNotIn(sub_channel, listed)

    def test_chat_is_not_listed(self):
        # Portal users cannot create channels, so the chat is opened by an
        # internal user with the portal user as the other participant.
        chat_id = self.env["discuss.channel"]._get_or_create_chat(
            partners_to=self.portal_partner.ids
        )["id"]
        chat = self.env["discuss.channel"].browse(chat_id)
        self.assertIn(self.portal_partner, chat.channel_partner_ids)
        self.assertEqual(chat.channel_type, "chat")
        self.assertNotIn(chat, self._get_listed_channels())

    def test_portal_page_lists_joined_channel_only(self):
        self.authenticate("portal_tester", self.password)
        response = self.url_open("/my/discuss")
        self.assertEqual(response.status_code, 200)
        self.assertIn(f"/discuss/channel/{self.joined_channel.id}", response.text)
        self.assertNotIn(f"/discuss/channel/{self.other_channel.id}", response.text)
        self.assertNotIn(f"/discuss/channel/{self.internal_channel.id}", response.text)

    def test_portal_home_shows_discuss_entry(self):
        self.authenticate("portal_tester", self.password)
        response = self.url_open("/my")
        self.assertEqual(response.status_code, 200)
        self.assertIn("/my/discuss", response.text)

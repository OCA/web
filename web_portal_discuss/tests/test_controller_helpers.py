from types import SimpleNamespace
from unittest.mock import patch

from werkzeug.exceptions import NotFound

from odoo.exceptions import AccessError
from odoo.tests.common import TransactionCase

from ..controllers.discuss_channel import PortalDiscussChannelController
from ..controllers.portal_discuss import PortalDiscussController
from ..controllers.thread import PortalDiscussThreadController


class TestPortalDiscussControllerHelpers(TransactionCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.portal_partner = cls.env["res.partner"].create(
            {
                "name": "Portal controller partner",
                "email": "portal-controller@example.com",
            }
        )
        cls.portal_user = (
            cls.env["res.users"]
            .with_context(no_reset_password=True)
            .create(
                {
                    "name": "Portal controller user",
                    "login": "portal-controller@example.com",
                    "partner_id": cls.portal_partner.id,
                    "share": True,
                    "groups_id": [(6, 0, [cls.env.ref("base.group_portal").id])],
                }
            )
        )
        cls.channel = cls.env["discuss.channel"].create(
            {
                "name": "Controller channel",
            }
        )
        cls.channel.sudo().add_members(
            partner_ids=[cls.portal_partner.id],
            post_joined_message=False,
        )
        cls.other_channel = cls.env["discuss.channel"].create(
            {
                "name": "Controller private channel",
            }
        )

    def _request(self, user):
        return SimpleNamespace(env=self.env(user=user))

    def test_channel_controller_checks_membership_and_not_found(self):
        controller = PortalDiscussChannelController()
        with patch(
            "odoo.addons.web_portal_discuss.controllers.discuss_channel.request",
            self._request(self.portal_user),
        ):
            self.assertEqual(
                controller._get_portal_channel(self.channel.id), self.channel
            )
            with self.assertRaises(AccessError):
                controller._get_portal_channel(self.other_channel.id)
            with self.assertRaises(NotFound):
                controller._get_portal_channel(999999999)

    def test_channel_controller_allows_public_native_handling(self):
        controller = PortalDiscussChannelController()
        public_user = self.env.ref("base.public_user")
        with patch(
            "odoo.addons.web_portal_discuss.controllers.discuss_channel.request",
            self._request(public_user),
        ):
            self.assertEqual(
                controller._get_portal_channel(self.channel.id), self.channel
            )

    def test_portal_controller_filters_selected_channels(self):
        controller = PortalDiscussController()
        with patch(
            "odoo.addons.web_portal_discuss.controllers.portal_discuss.request",
            self._request(self.portal_user),
        ):
            channels = controller._get_portal_channels(self.portal_user)
            self.assertIn(self.channel, channels)
            self.assertNotIn(self.other_channel, channels)
            self.assertEqual(
                controller._get_selected_channel(channels, self.channel.id),
                self.channel,
            )
            self.assertEqual(
                controller._get_selected_channel(channels, "invalid"),
                channels[:1],
            )
            self.assertFalse(
                controller._get_selected_channel(channels, self.other_channel.id)
            )

    def test_portal_controller_returns_no_channels_for_non_portal(self):
        controller = PortalDiscussController()
        public_user = self.env.ref("base.public_user")
        with patch(
            "odoo.addons.web_portal_discuss.controllers.portal_discuss.request",
            self._request(public_user),
        ):
            self.assertFalse(controller._get_portal_channels().exists())

    def test_thread_controller_checks_only_discuss_channels(self):
        controller = PortalDiscussThreadController()
        with patch(
            "odoo.addons.web_portal_discuss.controllers.thread.request",
            self._request(self.portal_user),
        ):
            controller._check_portal_channel_access("res.partner", self.channel.id)
            controller._check_portal_channel_access("discuss.channel", self.channel.id)
            with self.assertRaises(AccessError):
                controller._check_portal_channel_access(
                    "discuss.channel", self.other_channel.id
                )

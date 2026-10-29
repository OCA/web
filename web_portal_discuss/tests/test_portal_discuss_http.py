from odoo.tests import HttpCase, new_test_user, tagged


@tagged("post_install", "-at_install")
class TestPortalDiscussHttp(HttpCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.portal_user = new_test_user(
            cls.env,
            "portal_discuss_http_user",
            groups="base.group_portal",
        )
        cls.channel = cls.env["discuss.channel"].create(
            {
                "name": "Portal HTTP channel",
            }
        )
        cls.other_channel = cls.env["discuss.channel"].create(
            {
                "name": "Private HTTP channel",
            }
        )
        cls.channel.sudo().add_members(
            partner_ids=[cls.portal_user.partner_id.id],
            post_joined_message=False,
        )
        cls.channel.message_post(
            body="Message visible to the portal member",
            message_type="comment",
        )

    def _authenticate_portal(self):
        self.authenticate(self.portal_user.login, self.portal_user.login)

    def test_portal_member_can_open_discuss_page(self):
        self._authenticate_portal()
        response = self.url_open(f"/my/discuss?channel_id={self.channel.id}")
        self.assertEqual(response.status_code, 200)
        self.assertIn(b"Discussions", response.content)

    def test_portal_member_can_open_native_channel_route(self):
        self._authenticate_portal()
        response = self.url_open(
            f"/discuss/channel/{self.channel.id}",
            allow_redirects=False,
        )
        self.assertEqual(response.status_code, 303)
        self.assertIn(
            f"/my/discuss?channel_id={self.channel.id}",
            response.headers["Location"],
        )

    def test_portal_non_member_cannot_open_native_channel_route(self):
        self._authenticate_portal()
        response = self.url_open(f"/discuss/channel/{self.other_channel.id}")
        self.assertIn(response.status_code, (403, 404))

    def test_unknown_native_channel_returns_not_found(self):
        self._authenticate_portal()
        response = self.url_open("/discuss/channel/999999999")
        self.assertEqual(response.status_code, 404)

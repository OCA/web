# © 2022 Florian Kantelberg - initOS GmbH
# © 2026 Liam Noonan - Pyxiris
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

from odoo.tests import HttpCase, new_test_user, tagged

HOST = "127.0.0.1"


@tagged("post_install", "-at_install")
class TestClassicTheme(HttpCase):
    def setUp(self):
        super().setUp()
        self.test_portal_user = new_test_user(
            self.env, "test_portal_user", groups="base.group_portal"
        )
        # new_test_user() does not create a res_users_settings table for portal users
        # for some reason, even though in an actual db this exists. We forcibly make
        # it here so we can test that our logic does not run for portal users
        self.env["res.users.settings"].create(
            {"user_id": self.test_portal_user.id, "persistent_classic_theme": True}
        )

        self.test_internal_user = new_test_user(
            self.env, "test_internal_user", groups="base.group_user"
        )
        self.test_internal_user.write({"persistent_classic_theme": False})

    # Non internal user -> skip logic, do nothing
    def test_01_non_internal_user_ignored(self):
        self.authenticate(self.test_portal_user.login, self.test_portal_user.login)
        self.opener.cookies.set(
            "transient_classic_theme_cookie", "pure", domain=HOST, path="/"
        )
        response = self.url_open("/my")
        cookie_header = response.headers.get("Set-Cookie", "")
        self.assertNotIn(
            "transient_classic_theme_cookie",
            cookie_header,
            "We should have skipped over this due to being an external user",
        )

    # Persistent theme not set, no cookie -> do nothing
    def test_02_persistent_theme_not_set_no_cookie(self):
        self.authenticate(self.test_internal_user.login, self.test_internal_user.login)
        response = self.url_open("/odoo")
        cookie_header = response.headers.get("Set-Cookie", "")
        self.assertNotIn(
            "transient_classic_theme_cookie",
            cookie_header,
            "Persistent is not set and there was no cookie, "
            "so we should not be deleting the cookie",
        )

    # Persistent theme not set, cookie exists -> do nothing
    def test_03_persistent_theme_not_set_cookie_exists(self):
        self.authenticate(self.test_internal_user.login, self.test_internal_user.login)
        self.opener.cookies.set(
            "transient_classic_theme_cookie", "classic", domain=HOST, path="/"
        )
        response = self.url_open("/odoo")
        cookie_header = response.headers.get("Set-Cookie", "")
        self.assertNotIn(
            "transient_classic_theme_cookie",
            cookie_header,
            "Persistent is not set, so we should not be deleting the cookie",
        )

    # Persistent theme set, no cookie -> do nothing
    def test_04_persistent_theme_set_no_cookie(self):
        self.test_internal_user.write({"persistent_classic_theme": True})
        self.authenticate(self.test_internal_user.login, self.test_internal_user.login)
        response = self.url_open("/odoo")
        cookie_header = response.headers.get("Set-Cookie", "")
        self.assertNotIn(
            "transient_classic_theme_cookie",
            cookie_header,
            "Persistent is set but there was no cookie, "
            "so we should not be deleting the cookie",
        )

    # Persistent theme set, cookie exists -> delete cookie
    def test_05_persistent_theme_set_cookie_exists(self):
        self.test_internal_user.write({"persistent_classic_theme": True})
        self.authenticate(self.test_internal_user.login, self.test_internal_user.login)
        self.opener.cookies.set(
            "transient_classic_theme_cookie", "classic", domain=HOST, path="/"
        )
        response = self.url_open("/odoo")
        cookie_header = response.headers.get("Set-Cookie", "")
        self.assertIn("transient_classic_theme_cookie", cookie_header)

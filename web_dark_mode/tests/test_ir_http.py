# © 2022 Florian Kantelberg - initOS GmbH
# © 2026 Liam Noonan - Pyxiris
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

from odoo.tests import HttpCase, new_test_user, tagged

HOST = "127.0.0.1"


@tagged("post_install", "-at_install")
class TestColorScheme(HttpCase):
    def setUp(self):
        super().setUp()
        self.test_portal_user = new_test_user(
            self.env, "test_portal_user", groups="base.group_portal"
        )
        self.test_internal_user = new_test_user(
            self.env, "test_internal_user", groups="base.group_user"
        )
        self.test_internal_user.write(
            {
                "dark_mode": False,
                "dark_mode_device_dependent": False,
            }
        )

    # Non internal user -> skip logic, do nothing
    def test_01_non_internal_user_ignored(self):
        self.authenticate(self.test_portal_user.login, self.test_portal_user.login)
        response = self.url_open("/my")
        cookie_header = response.headers.get("Set-Cookie", "")
        self.assertNotIn(
            "color_scheme",
            cookie_header,
            "Color scheme logic should not run for non-internal users",
        )

    # No user preference, no cookie -> set light
    def test_02_no_user_settings_no_cookie(self):
        self.opener.cookies.clear()
        self.authenticate(self.test_internal_user.login, self.test_internal_user.login)
        response = self.url_open("/odoo")
        cookie_header = response.headers.get("Set-Cookie", "")
        self.assertIn("color_scheme=light", cookie_header)
        self.assertEqual(self.opener.cookies.get("color_scheme"), "light")

    # No user preference, light cookie -> do nothing
    def test_03_no_user_settings_light_cookie(self):
        self.authenticate(self.test_internal_user.login, self.test_internal_user.login)
        self.opener.cookies.set("color_scheme", "light", domain=HOST, path="/")
        response = self.url_open("/odoo")
        cookie_header = response.headers.get("Set-Cookie", "")
        self.assertNotIn(
            "color_scheme",
            cookie_header,
            "The server should not set the cookie if already exists and is correct",
        )
        self.assertEqual(self.opener.cookies.get("color_scheme"), "light")

    # User dark, cookie light -> set dark
    def test_04_user_dark_cookie_light(self):
        self.test_internal_user.write(
            {
                "dark_mode": True,
                "dark_mode_device_dependent": False,
            }
        )
        self.authenticate(self.test_internal_user.login, self.test_internal_user.login)
        self.opener.cookies.set("color_scheme", "light", domain=HOST, path="/")
        response = self.url_open("/odoo")
        cookie_header = response.headers.get("Set-Cookie", "")
        self.assertIn("color_scheme=dark", cookie_header)
        self.assertEqual(self.opener.cookies.get("color_scheme"), "dark")

    # User dark, cookie dark -> do nothing
    def test_05_user_dark_cookie_dark(self):
        self.test_internal_user.write(
            {
                "dark_mode": True,
                "dark_mode_device_dependent": False,
            }
        )
        self.authenticate(self.test_internal_user.login, self.test_internal_user.login)
        self.opener.cookies.set("color_scheme", "dark", domain=HOST, path="/")
        response = self.url_open("/odoo")
        cookie_header = response.headers.get("Set-Cookie", "")
        self.assertNotIn(
            "color_scheme",
            cookie_header,
            "The server should not set the cookie if already exists and is correct",
        )
        self.assertEqual(self.opener.cookies.get("color_scheme"), "dark")

    # User dev dep + dark, browser none, cookie none -> do nothing
    def test_06_user_dev_dep_browser_none_cookie_none(self):
        self.test_internal_user.write(
            {
                "dark_mode": True,
                "dark_mode_device_dependent": True,
            }
        )
        self.authenticate(self.test_internal_user.login, self.test_internal_user.login)
        headers = {"Sec-CH-Prefers-Color-Scheme": None}
        response = self.url_open("/odoo", headers=headers)
        cookie_header = response.headers.get("Set-Cookie", "")
        # This also makes sure that device dependent is overruling regular dark mode
        self.assertNotIn(
            "color_scheme",
            cookie_header,
            "The server should not set the cookie as it will be set by client side js",
        )

    # User dev dep, browser light, cookie light -> do nothing
    def test_07_user_dev_dep_browser_light_cookie_light(self):
        self.test_internal_user.write(
            {
                "dark_mode": True,
                "dark_mode_device_dependent": True,
            }
        )
        self.authenticate(self.test_internal_user.login, self.test_internal_user.login)
        self.opener.cookies.set("color_scheme", "light", domain=HOST, path="/")
        headers = {"Sec-CH-Prefers-Color-Scheme": "light"}
        response = self.url_open("/odoo", headers=headers)
        cookie_header = response.headers.get("Set-Cookie", "")
        self.assertNotIn(
            "color_scheme",
            cookie_header,
            "The server should not set the cookie if already exists and is correct",
        )
        self.assertEqual(self.opener.cookies.get("color_scheme"), "light")

    # User dev dep, browser dark, cookie light -> set dark
    def test_08_user_dev_dep_browser_dark_cookie_light(self):
        self.test_internal_user.write(
            {
                "dark_mode": False,
                "dark_mode_device_dependent": True,
            }
        )
        self.authenticate(self.test_internal_user.login, self.test_internal_user.login)
        self.opener.cookies.set("color_scheme", "light", domain=HOST, path="/")
        headers = {"Sec-CH-Prefers-Color-Scheme": "dark"}
        response = self.url_open("/odoo", headers=headers)
        cookie_header = response.headers.get("Set-Cookie", "")
        self.assertIn("color_scheme=dark", cookie_header)
        self.assertEqual(self.opener.cookies.get("color_scheme"), "dark")

    def test_09_vary_headers(self):
        self.authenticate(self.test_internal_user.login, self.test_internal_user.login)
        response = self.url_open("/odoo")
        self.assertIn("Sec-CH-Prefers-Color-Scheme", response.headers.get("Vary", ""))
        self.assertIn(
            "Sec-CH-Prefers-Color-Scheme", response.headers.get("Accept-CH", "")
        )

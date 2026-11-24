# © 2022 Florian Kantelberg - initOS GmbH
# Copyright 2026 Altixia (https://www.altixia.com)
# @author: Claude Perrin <claude@altixia.com>
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

import json
import re
from unittest.mock import MagicMock

from lxml import etree

import odoo.http
from odoo.exceptions import AccessError
from odoo.tests import HttpCase, common, new_test_user, tagged

from ..models.res_users import reload_page


class TestDarkMode(common.TransactionCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.request = MagicMock(env=cls.env)
        odoo.http._request_stack.push(cls.request)
        cls.addClassCleanup(odoo.http._request_stack.pop)

    def test_dark_mode_cookie(self):
        response = MagicMock()

        # Cookie is set because the color_scheme changed
        self.request.httprequest.cookies = {"color_scheme": "dark"}
        self.env["ir.http"]._post_dispatch(response)
        response.set_cookie.assert_called_with("color_scheme", "light")

        # Cookie isn't set because the color_scheme is the same
        response.reset_mock()
        self.request.httprequest.cookies = {"color_scheme": "light"}
        self.env["ir.http"]._post_dispatch(response)
        response.set_cookie.assert_not_called()

        # Cookie isn't set because it's device dependent
        self.env.user.dark_mode_device_dependent = True
        self.request.httprequest.cookies = {"color_scheme": "dark"}
        self.env["ir.http"]._post_dispatch(response)
        response.set_cookie.assert_not_called()


class TestAppearance(common.TransactionCase):
    def test_appearance_follows_the_two_settings(self):
        user = new_test_user(self.env, login="appearance")
        as_user = user.with_user(user)
        as_user.write({"color_scheme_mode": "dark"})
        self.assertEqual(
            (user.dark_mode, user.dark_mode_device_dependent, user.color_scheme_mode),
            (True, False, "dark"),
        )
        as_user.write({"color_scheme_mode": "light"})
        self.assertEqual(
            (user.dark_mode, user.dark_mode_device_dependent, user.color_scheme_mode),
            (False, False, "light"),
        )
        as_user.write({"color_scheme_mode": "auto"})
        self.assertTrue(user.dark_mode_device_dependent)
        self.assertEqual(user.color_scheme_mode, "auto")
        # the "Dark Mode" switch of the user menu shows in the appearance too
        as_user.write({"dark_mode": True, "dark_mode_device_dependent": False})
        self.assertEqual(user.color_scheme_mode, "dark")

    def test_appearance_is_ones_own(self):
        user = new_test_user(self.env, login="appearance_self")
        other = new_test_user(self.env, login="appearance_other")
        with self.assertRaises(AccessError):
            other.with_user(user).write({"color_scheme_mode": "dark"})
        self.assertFalse(other.dark_mode)

    def test_preferences_show_the_appearance_and_reload_the_page(self):
        user = new_test_user(self.env, login="appearance_view")
        view = self.env.ref("base.view_users_form_simple_modif")
        arch = etree.fromstring(
            self.env["res.users"].with_user(user).get_view(view.id, "form")["arch"]
        )
        appearance = arch.xpath("//field[@name='color_scheme_mode']")
        self.assertTrue(appearance)
        self.assertFalse(arch.xpath("//field[@name='dark_mode_device_dependent']"))
        # next to the language and the time zone
        self.assertTrue(appearance[0].getparent().xpath("field[@name='tz']"))
        self.assertEqual(
            user.with_user(user).preference_save(),
            {"type": "ir.actions.client", "tag": "reload"},
        )

    def test_only_the_context_reload_becomes_a_page_reload(self):
        other = {"type": "ir.actions.act_window", "res_model": "res.users"}
        for action in (other, False, None, True):
            with self.subTest(action=action):
                self.assertIs(reload_page(action), action)


@tagged("post_install", "-at_install")
class TestAppearanceSession(HttpCase):
    """From a real session, as the web client writes it."""

    def _set_scheme_cookie(self, scheme):
        """Put `color_scheme` in the test client's cookie jar, keeping the cookies of
        the test framework (session, test request key)."""
        for cookie in list(self.opener.cookies):
            if cookie.name == "color_scheme":
                self.opener.cookies.clear(cookie.domain, cookie.path, cookie.name)
        self.opener.cookies.set("color_scheme", scheme)

    def _write_as_user(self, user, values, scheme):
        """Write as the web client does, with a given `color_scheme` cookie; return
        the cookie the server sets back, if any."""
        self._set_scheme_cookie(scheme)
        response = self.url_open(
            "/web/dataset/call_kw/res.users/write",
            data=json.dumps(
                {
                    "jsonrpc": "2.0",
                    "method": "call",
                    "id": 1,
                    "params": {
                        "model": "res.users",
                        "method": "write",
                        "args": [[user.id], values],
                        "kwargs": {},
                    },
                }
            ),
            headers={"Content-Type": "application/json"},
        )
        self.assertEqual(response.status_code, 200)
        self.assertNotIn("error", response.json())
        match = re.search(r"color_scheme=(\w+)", response.headers.get("Set-Cookie", ""))
        return match and match.group(1)

    def test_appearance_from_the_preferences(self):
        user = new_test_user(
            self.env, login="appearance_http", password="appearance_pw"
        )
        self.authenticate("appearance_http", "appearance_pw")
        info = self.make_jsonrpc_request("/web/session/get_session_info", {})
        self.assertFalse(info["dark_mode_device_dependent"])
        # Dark and Light are choices made by hand, applied to the cookie at once
        self.assertEqual(
            self._write_as_user(user, {"color_scheme_mode": "dark"}, "light"), "dark"
        )
        # Dark then Default with a cookie still dark: the server no longer forces it
        # and the session tells the web client to follow the device
        self.assertIsNone(
            self._write_as_user(user, {"color_scheme_mode": "auto"}, "dark")
        )
        user.invalidate_recordset()
        self.assertEqual(
            (user.dark_mode, user.dark_mode_device_dependent), (True, True)
        )
        info = self.make_jsonrpc_request("/web/session/get_session_info", {})
        self.assertTrue(info["dark_mode_device_dependent"])
        # the cookie set back to light by the web client (light device) holds
        self._set_scheme_cookie("light")
        response = self.url_open("/web")
        self.assertEqual(response.status_code, 200)
        self.assertNotIn("color_scheme=", response.headers.get("Set-Cookie", ""))
        self.assertEqual(
            self._write_as_user(user, {"color_scheme_mode": "light"}, "dark"), "light"
        )

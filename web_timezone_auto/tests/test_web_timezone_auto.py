# Copyright 2026 Altixia (https://www.altixia.com)
# @author: Claude Perrin <claude@altixia.com>
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

from contextlib import contextmanager

from lxml import etree

from odoo import SUPERUSER_ID
from odoo.exceptions import AccessError
from odoo.http import root
from odoo.tests import HttpCase, TransactionCase, new_test_user, tagged


@contextmanager
def watch_writes(model):
    """Record the writes on `model`: nothing must be written when nothing changes
    (each write of `tz` clears the server caches)."""
    writes = []
    cls = type(model)
    own = cls.__dict__.get("write")
    original = cls.write

    def write(self, vals):
        writes.append(vals)
        return original(self, vals)

    cls.write = write
    try:
        yield writes
    finally:
        if own is None:
            del cls.write
        else:
            cls.write = own


@tagged("post_install", "-at_install")
class TestWebTimezoneAuto(TransactionCase):
    def _sync(self, user, tz):
        return self.env["res.users"].with_user(user).web_timezone_auto_sync(tz)

    def test_every_user_follows_the_device_by_default(self):
        self.assertTrue(new_test_user(self.env, login="tz_new").tz_auto)
        # users that existed before the installation: the system user, nobody sets it
        # by hand
        self.assertTrue(self.env.ref("base.user_root").tz_auto)

    def test_the_device_time_zone_is_written(self):
        user = new_test_user(self.env, login="tz_travel", tz=False)
        self.assertEqual(self._sync(user, "Asia/Bangkok"), "Asia/Bangkok")
        self.assertEqual(user.tz, "Asia/Bangkok")
        self.assertEqual(self._sync(user, "Europe/Lisbon"), "Europe/Lisbon")
        self.assertEqual(user.tz, "Europe/Lisbon")

    def test_nothing_is_written_when_nothing_changes(self):
        """Another tab already wrote this time zone: this one takes it too (returned),
        without writing it again."""
        user = new_test_user(self.env, login="tz_same", tz="Asia/Bangkok")
        with watch_writes(self.env["res.users"]) as writes:
            self.assertEqual(self._sync(user, "Asia/Bangkok"), "Asia/Bangkok")
        self.assertEqual(writes, [])

    def test_an_unknown_time_zone_is_refused(self):
        user = new_test_user(self.env, login="tz_unknown", tz="Asia/Bangkok")
        for tz in ("Etc/Unknown", "Mars/Olympus", "", None, 7, ["Europe/Lisbon"]):
            with self.subTest(tz=tz), watch_writes(self.env["res.users"]) as writes:
                self.assertFalse(self._sync(user, tz))
                self.assertEqual(user.tz, "Asia/Bangkok")
                self.assertEqual(writes, [])

    def test_a_fixed_time_zone_never_moves(self):
        user = new_test_user(self.env, login="tz_fixed", tz="Europe/Paris")
        user.with_user(user).write({"tz_auto": False})
        with watch_writes(self.env["res.users"]) as writes:
            self.assertFalse(self._sync(user, "Asia/Bangkok"))
        self.assertEqual(user.tz, "Europe/Paris")
        self.assertEqual(writes, [])

    def test_the_superuser_is_left_alone(self):
        root_user = self.env["res.users"].browse(SUPERUSER_ID)
        before = root_user.tz
        tz = "Pacific/Auckland" if before != "Pacific/Auckland" else "Europe/Lisbon"
        self.assertFalse(self._sync(root_user, tz))
        self.assertEqual(root_user.tz, before)

    def test_only_ones_own_account(self):
        user = new_test_user(self.env, login="tz_self", tz=False)
        other = new_test_user(self.env, login="tz_other", tz="Europe/Paris")
        self.assertEqual(self._sync(user, "Asia/Bangkok"), "Asia/Bangkok")
        self.assertEqual(other.tz, "Europe/Paris")
        # everyone sets their own setting, not someone else's
        with self.assertRaises(AccessError):
            other.with_user(user).write({"tz_auto": False})
        self.assertTrue(other.tz_auto)

    def _assert_setting_before_a_read_only_time_zone(self, user, view):
        arch = etree.fromstring(
            self.env["res.users"].with_user(user).get_view(view.id, "form")["arch"]
        )
        setting = arch.xpath("//field[@name='tz_auto']")[0]
        self.assertEqual(setting.getnext().get("name"), "tz")
        self.assertEqual(
            arch.xpath("//field[@name='tz']")[0].get("readonly"), "tz_auto"
        )
        self.assertNotEqual(setting.get("readonly"), "1")
        return arch

    def test_preferences_show_the_setting_before_a_read_only_time_zone(self):
        user = new_test_user(self.env, login="tz_view")
        self._assert_setting_before_a_read_only_time_zone(
            user, self.env.ref("base.view_users_form_simple_modif")
        )

    def test_the_user_form_shows_it_to_the_administrator(self):
        admin = new_test_user(
            self.env, login="tz_admin", groups="base.group_user,base.group_system"
        )
        self._assert_setting_before_a_read_only_time_zone(
            admin, self.env.ref("base.view_users_form")
        )

    def test_another_module_may_add_a_field_after_the_time_zone(self):
        base = self.env.ref("base.view_users_form_simple_modif")
        self.env["ir.ui.view"].create(
            {
                "name": "tz_after",
                "model": "res.users",
                "inherit_id": base.id,
                "arch": '<field name="tz" position="after">'
                '<field name="tz_offset"/></field>',
            }
        )
        arch = self._assert_setting_before_a_read_only_time_zone(
            new_test_user(self.env, login="tz_after"), base
        )
        self.assertEqual(
            arch.xpath("//field[@name='tz']")[0].getnext().get("name"), "tz_offset"
        )


@tagged("post_install", "-at_install")
class TestWebTimezoneAutoSession(HttpCase):
    """From a real session, as the web client calls it."""

    def _sync(self, tz):
        return self.make_jsonrpc_request(
            "/web/dataset/call_kw/res.users/web_timezone_auto_sync",
            {
                "model": "res.users",
                "method": "web_timezone_auto_sync",
                "args": [tz],
                "kwargs": {},
            },
        )

    def test_the_session_tells_the_interface_and_takes_the_new_time_zone(self):
        user = new_test_user(
            self.env, login="tz_session", password="tz_session_pw", tz=False
        )
        self.authenticate("tz_session", "tz_session_pw")
        info = self.make_jsonrpc_request("/web/session/get_session_info", {})
        self.assertTrue(info["tz_auto"])
        self.assertEqual(self._sync("Europe/Lisbon"), "Europe/Lisbon")
        user.invalidate_recordset(["tz"])
        self.assertEqual(user.tz, "Europe/Lisbon")
        # the session context follows at once, before any other call (routes without
        # a context)
        self.assertEqual(
            root.session_store.get(self.session.sid).context.get("tz"), "Europe/Lisbon"
        )
        info = self.make_jsonrpc_request("/web/session/get_session_info", {})
        self.assertEqual(info["user_context"]["tz"], "Europe/Lisbon")
        user.with_user(user).write({"tz_auto": False})
        info = self.make_jsonrpc_request("/web/session/get_session_info", {})
        self.assertFalse(info["tz_auto"])

    def test_nothing_is_written_while_someone_takes_over_the_account(self):
        user = new_test_user(
            self.env, login="tz_taken", password="tz_taken_pw", tz="Asia/Bangkok"
        )
        self.authenticate("tz_taken", "tz_taken_pw")
        # what impersonate_login (OCA/server-auth) sets when an administrator takes
        # over the account
        self.session["impersonate_from_uid"] = self.env.ref("base.user_admin").id
        root.session_store.save(self.session)
        self.assertFalse(self._sync("Europe/Lisbon"))
        user.invalidate_recordset(["tz"])
        self.assertEqual(user.tz, "Asia/Bangkok")

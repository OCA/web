# Copyright 2016 ACSONE SA/NV
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

import json

from odoo.tests import common

from odoo.addons.bus.models.bus import json_dump

from ..models.res_users import DANGER, DEFAULT, INFO, SUCCESS, WARNING


class TestResUsers(common.TransactionCase):
    def test_notify_success(self):
        bus_bus = self.env["bus.bus"]
        channel_name = json_dump(
            [
                self.env.cr.dbname,
                self.env.user.partner_id._name,
                self.env.user.partner_id.id,
            ]
        )
        domain = [("channel", "=", channel_name)]
        existing = bus_bus.search(domain)
        test_msg = {
            "message": "message",
            "title": "title",
            "sticky": True,
            "notify_ui": "odoo",
            "beep": False,
        }
        self.env.user.notify_success(**test_msg)
        news = bus_bus.search(domain) - existing
        self.assertEqual(1, len(news))
        test_msg.update({"type_message": SUCCESS})

        self.assertDictEqual(test_msg, json.loads(news.message).get("payload", dict()))

    def test_notify_danger(self):
        bus_bus = self.env["bus.bus"]
        channel_name = json_dump(
            [
                self.env.cr.dbname,
                self.env.user.partner_id._name,
                self.env.user.partner_id.id,
            ]
        )
        domain = [("channel", "=", channel_name)]
        existing = bus_bus.search(domain)
        test_msg = {
            "message": "message",
            "title": "title",
            "sticky": True,
            "notify_ui": "odoo",
            "beep": False,
        }
        self.env.user.notify_danger(**test_msg)
        news = bus_bus.search(domain) - existing
        self.assertEqual(1, len(news))
        test_msg.update({"type_message": DANGER})
        self.assertDictEqual(test_msg, json.loads(news.message).get("payload", dict()))

    def test_notify_warning(self):
        bus_bus = self.env["bus.bus"]
        channel_name = json_dump(
            [
                self.env.cr.dbname,
                self.env.user.partner_id._name,
                self.env.user.partner_id.id,
            ]
        )
        domain = [("channel", "=", channel_name)]
        existing = bus_bus.search(domain)
        test_msg = {
            "message": "message",
            "title": "title",
            "sticky": True,
            "notify_ui": "odoo",
            "beep": False,
        }
        self.env.user.notify_warning(**test_msg)
        news = bus_bus.search(domain) - existing
        self.assertEqual(1, len(news))
        test_msg.update({"type_message": WARNING})
        self.assertDictEqual(test_msg, json.loads(news.message).get("payload", dict()))

    def test_notify_info(self):
        bus_bus = self.env["bus.bus"]
        channel_name = json_dump(
            [
                self.env.cr.dbname,
                self.env.user.partner_id._name,
                self.env.user.partner_id.id,
            ]
        )
        domain = [("channel", "=", channel_name)]
        existing = bus_bus.search(domain)
        test_msg = {
            "message": "message",
            "title": "title",
            "sticky": True,
            "notify_ui": "odoo",
            "beep": False,
        }
        self.env.user.notify_info(**test_msg)
        news = bus_bus.search(domain) - existing
        self.assertEqual(1, len(news))
        test_msg.update({"type_message": INFO})
        self.assertDictEqual(test_msg, json.loads(news.message).get("payload", dict()))

    def test_notify_default(self):
        bus_bus = self.env["bus.bus"]
        channel_name = json_dump(
            [
                self.env.cr.dbname,
                self.env.user.partner_id._name,
                self.env.user.partner_id.id,
            ]
        )
        domain = [("channel", "=", channel_name)]
        existing = bus_bus.search(domain)
        test_msg = {
            "message": "message",
            "title": "title",
            "sticky": True,
            "notify_ui": "odoo",
            "beep": False,
        }
        self.env.user.notify_default(**test_msg)
        news = bus_bus.search(domain) - existing
        self.assertEqual(1, len(news))
        test_msg.update({"type_message": DEFAULT})
        self.assertDictEqual(test_msg, json.loads(news.message).get("payload", dict()))

    def test_swal_notify_success(self):
        bus_bus = self.env["bus.bus"]
        channel_name = json_dump(
            [
                self.env.cr.dbname,
                self.env.user.partner_id._name,
                self.env.user.partner_id.id,
            ]
        )
        domain = [("channel", "=", channel_name)]
        existing = bus_bus.search(domain)
        test_msg = {
            "message": "message",
            "title": "title",
            "sticky": True,
            "notify_ui": "sweet",
            "beep": False,
        }
        self.env.user.notify_success(**test_msg)
        news = bus_bus.search(domain) - existing
        self.assertEqual(1, len(news))
        test_msg.update({"type_message": SUCCESS})

        self.assertDictEqual(test_msg, json.loads(news.message).get("payload", dict()))

    def test_swal_notify_danger(self):
        bus_bus = self.env["bus.bus"]
        channel_name = json_dump(
            [
                self.env.cr.dbname,
                self.env.user.partner_id._name,
                self.env.user.partner_id.id,
            ]
        )
        domain = [("channel", "=", channel_name)]
        existing = bus_bus.search(domain)
        test_msg = {
            "message": "message",
            "title": "title",
            "sticky": True,
            "notify_ui": "sweet",
            "beep": False,
        }
        self.env.user.notify_danger(**test_msg)
        news = bus_bus.search(domain) - existing
        self.assertEqual(1, len(news))
        test_msg.update({"type_message": DANGER})
        self.assertDictEqual(test_msg, json.loads(news.message).get("payload", dict()))

    def test_swal_notify_warning(self):
        bus_bus = self.env["bus.bus"]
        channel_name = json_dump(
            [
                self.env.cr.dbname,
                self.env.user.partner_id._name,
                self.env.user.partner_id.id,
            ]
        )
        domain = [("channel", "=", channel_name)]
        existing = bus_bus.search(domain)
        test_msg = {
            "message": "message",
            "title": "title",
            "sticky": True,
            "notify_ui": "sweet",
            "beep": False,
        }
        self.env.user.notify_warning(**test_msg)
        news = bus_bus.search(domain) - existing
        self.assertEqual(1, len(news))
        test_msg.update({"type_message": WARNING})
        self.assertDictEqual(test_msg, json.loads(news.message).get("payload", dict()))

    def test_swal_notify_info(self):
        bus_bus = self.env["bus.bus"]
        channel_name = json_dump(
            [
                self.env.cr.dbname,
                self.env.user.partner_id._name,
                self.env.user.partner_id.id,
            ]
        )
        domain = [("channel", "=", channel_name)]
        existing = bus_bus.search(domain)
        test_msg = {
            "message": "message",
            "title": "title",
            "sticky": True,
            "notify_ui": "sweet",
            "beep": False,
        }
        self.env.user.notify_info(**test_msg)
        news = bus_bus.search(domain) - existing
        self.assertEqual(1, len(news))
        test_msg.update({"type_message": INFO})
        self.assertDictEqual(test_msg, json.loads(news.message).get("payload", dict()))

    def test_swal_notify_default(self):
        bus_bus = self.env["bus.bus"]
        channel_name = json_dump(
            [
                self.env.cr.dbname,
                self.env.user.partner_id._name,
                self.env.user.partner_id.id,
            ]
        )
        domain = [("channel", "=", channel_name)]
        existing = bus_bus.search(domain)
        test_msg = {
            "message": "message",
            "title": "title",
            "sticky": True,
            "notify_ui": "sweet",
            "beep": False,
        }
        self.env.user.notify_default(**test_msg)
        news = bus_bus.search(domain) - existing
        self.assertEqual(1, len(news))
        test_msg.update({"type_message": DEFAULT})
        self.assertDictEqual(test_msg, json.loads(news.message).get("payload", dict()))

import json

from odoo.tests import new_test_user, tagged

from odoo.addons.bus.models.bus import channel_with_db, hashable
from odoo.addons.bus.tests.common import WebsocketCase
from odoo.addons.bus.websocket import dispatch

from ..models.base import NOTIFICATION_TYPE, record_events_channel

PARTNER_CHANNEL = record_events_channel("res.partner")


@tagged("post_install", "-at_install")
class TestRecordEventsWebsocket(WebsocketCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.internal_user = new_test_user(
            cls.env, login="bre_internal", password="bre_internal_pw1"
        )
        cls.portal_user = new_test_user(
            cls.env,
            login="bre_portal",
            password="bre_portal_pw1",
            groups="base.group_portal",
        )

    def subscribed(self, channel):
        key = hashable(channel_with_db(self.registry.db_name, channel))
        return bool(dispatch._channels_to_ws.get(key))

    def connect_as(self, login, password):
        session = self.authenticate(login, password)
        return self.websocket_connect(cookie=f"session_id={session.sid};")

    def test_channel_filter_by_user(self):
        websocket_ws = self.env["ir.websocket"]
        channels = {
            PARTNER_CHANNEL,
            record_events_channel("ir.ui.view"),
            record_events_channel("no.such.model"),
            record_events_channel(""),
        }
        self.assertEqual(
            websocket_ws.with_user(
                self.internal_user
            )._bus_record_events_allowed_channels(channels),
            {PARTNER_CHANNEL},
        )
        self.assertEqual(
            websocket_ws.with_user(
                self.portal_user
            )._bus_record_events_allowed_channels(channels),
            set(),
        )

    def test_channel_requires_model_read_access(self):
        self.patch(type(self.env["res.partner"]), "has_access", lambda self, op: False)
        self.assertEqual(
            self.env["ir.websocket"]
            .with_user(self.internal_user)
            ._bus_record_events_allowed_channels({PARTNER_CHANNEL}),
            set(),
        )

    def test_portal_user_cannot_subscribe(self):
        websocket = self.connect_as("bre_portal", "bre_portal_pw1")
        self.subscribe(websocket, [PARTNER_CHANNEL], self.env["bus.bus"]._bus_last_id())
        self.assertFalse(self.subscribed(PARTNER_CHANNEL))

    def test_internal_user_receives_record_events(self):
        websocket = self.connect_as("bre_internal", "bre_internal_pw1")
        self.subscribe(
            websocket,
            [PARTNER_CHANNEL, record_events_channel("ir.ui.view")],
            self.env["bus.bus"]._bus_last_id(),
        )
        self.assertTrue(self.subscribed(PARTNER_CHANNEL))
        self.assertFalse(self.subscribed(record_events_channel("ir.ui.view")))

        partner = self.env["res.partner"].create({"name": "Live"})
        self.trigger_notification_dispatching([PARTNER_CHANNEL])

        notifications = json.loads(websocket.recv())
        messages = [n["message"] for n in notifications]
        self.assertIn(
            {
                "type": NOTIFICATION_TYPE,
                "payload": {
                    "model": "res.partner",
                    "created": [partner.id],
                    "written": [],
                    "unlinked": [],
                },
            },
            messages,
        )

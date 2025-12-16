import json
import logging
import time

from odoo.tests import tagged
from odoo.tests.common import new_test_user

from odoo.addons.bus.tests.common import WebsocketCase

from .common import TestBusRecordEventsCase

_logger = logging.getLogger(__name__)


@tagged("-at_install", "post_install")
class TestBusRecordEventsWebsocket(TestBusRecordEventsCase, WebsocketCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()

        # Create access rights for the fake model
        cls.env["ir.model.access"].create(
            {
                "name": "access_bus_record_event_fake_user",
                "model_id": cls.env["ir.model"]._get("bus.record.event.fake").id,
                "group_id": cls.env.ref("base.group_user").id,
                "perm_read": 1,
                "perm_write": 1,
                "perm_create": 1,
                "perm_unlink": 1,
            }
        )

        # Create record rule
        cls.env["ir.rule"].create(
            {
                "name": "Fake Model Rule",
                "model_id": cls.env["ir.model"]._get("bus.record.event.fake").id,
                "domain_force": "[('user_id', '=', user.id)]",
                "groups": [(4, cls.env.ref("base.group_user").id)],
            }
        )

    @classmethod
    def tearDownClass(cls):
        cls.loader.restore_registry()
        super().tearDownClass()

    def _is_message_for_record(self, notification, record_id):
        """Check if the notification is for the given record."""
        message = notification.get("message")
        if not message:
            return False

        # Handle potential string message (if bus sends it as string)
        if isinstance(message, str):
            try:
                message = json.loads(message)
            except json.JSONDecodeError:
                _logger.exception("Failed to decode message JSON")
                pass

        if not isinstance(message, dict):
            return False

        if message.get("type") != "bus.record/event":
            return False

        payload = message.get("payload")
        if not payload:
            return False

        if payload.get("model") != "bus.record.event.fake":
            return False

        try:
            data = payload.get("data")
            return data.get("id") == record_id
        except Exception:
            return False

    def test_permission_check_websocket(self):
        """Test that notifications are filtered based on permissions."""
        user_1 = new_test_user(self.env, login="ws_user_1", groups="base.group_user")
        user_2 = new_test_user(self.env, login="ws_user_2", groups="base.group_user")

        record_u1 = (
            self.env["bus.record.event.fake"]
            .with_user(user_1)
            .create({"name": "User 1", "user_id": user_1.id})
        )
        record_u2 = (
            self.env["bus.record.event.fake"]
            .with_user(user_2)
            .create({"name": "User 2", "user_id": user_2.id})
        )

        # Authenticate as User 1
        session = self.authenticate("ws_user_1", "ws_user_1")
        websocket = self.websocket_connect(cookie=f"session_id={session.sid};")

        # Channels to subscribe
        channel_u1 = f"record_events:bus.record.event.fake:{record_u1.id}"
        channel_u2 = f"record_events:bus.record.event.fake:{record_u2.id}"

        # Subscribe to both channels
        # User 1 should only be successfully subscribed to channel_u1
        self.subscribe(
            websocket, [channel_u1, channel_u2], self.env["bus.bus"]._bus_last_id()
        )

        # Trigger notification for U2 (User 1 should NOT receive it)
        record_u2.write({"name": "Update U2"})
        self.trigger_notification_dispatching([channel_u2])

        # Trigger notification for U1 (User 1 SHOULD receive it)
        record_u1.write({"name": "Update U1"})
        self.trigger_notification_dispatching([channel_u1])

        # Read messages
        messages = []
        start_time = time.time()
        # Wait up to 5 seconds for messages
        while time.time() - start_time < 5:
            try:
                frame = websocket.recv()
                data = json.loads(frame)
                if isinstance(data, list):
                    messages.extend(data)
                    # If we found the message for U1, we can stop waiting
                    if any(
                        self._is_message_for_record(m, record_u1.id) for m in messages
                    ):
                        break
            except Exception:
                _logger.exception("Error receiving websocket message")
                # Timeout or other error
                pass

        # Verify results
        u1_msgs = [m for m in messages if self._is_message_for_record(m, record_u1.id)]
        u2_msgs = [m for m in messages if self._is_message_for_record(m, record_u2.id)]

        self.assertTrue(
            u1_msgs, "User 1 should receive notification for their own record"
        )
        self.assertFalse(
            u2_msgs, "User 1 should NOT receive notification for User 2's record"
        )

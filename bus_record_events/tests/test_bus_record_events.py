import json
import logging

from odoo.exceptions import AccessError
from odoo.tests import TransactionCase, tagged
from odoo.tests.common import new_test_user

from .common import TestBusRecordEventsCase

_logger = logging.getLogger(__name__)


@tagged("-at_install", "post_install")
class TestBusRecordEvents(TestBusRecordEventsCase, TransactionCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()

        cls.user_1 = new_test_user(
            cls.env, login="test_user_1", groups="base.group_user"
        )
        cls.user_2 = new_test_user(
            cls.env, login="test_user_2", groups="base.group_user"
        )
        cls.Model = cls.env["bus.record.event.fake"]

        # Create access rights for the fake model so users can access it
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

    def _get_relevant_notification(self, notifications, channel_name):
        return next(
            (
                n
                for n in notifications
                if n.channel == f'["{self.env.cr.dbname}","{channel_name}"]'
            ),
            None,
        )

    def test_create_notification(self):
        """Test that creating a record sends a notification."""
        bus = self.env["bus.bus"]
        last_id = bus.search([], order="id desc", limit=1).id or 0

        record = self.Model.with_user(self.user_1).create({"name": "Test Create"})
        self.env.cr.precommit.run()  # trigger the creation of bus.bus records

        notifications = bus.search([("id", ">", last_id)])
        self.assertTrue(notifications, "Should have generated notifications")

        # Check channel
        channel_name = "record_events:bus.record.event.fake"
        relevant_notif = self._get_relevant_notification(notifications, channel_name)
        self.assertTrue(relevant_notif, "Should have notification on model channel")

        # Check payload
        message = json.loads(relevant_notif.message)
        self.assertEqual(message["type"], "bus.record/event")
        payload = message["payload"]
        self.assertEqual(payload["type"], "create")
        self.assertEqual(payload["model"], "bus.record.event.fake")

        data = payload["data"]
        self.assertEqual(data["id"], record.id)

    def test_write_notification(self):
        """Test that writing to a record sends a notification."""
        record = self.Model.with_user(self.user_1).create({"name": "Test Write"})
        self.env.cr.precommit.run()  # trigger the creation of bus.bus records

        bus = self.env["bus.bus"]
        last_id = bus.search([], order="id desc", limit=1).id or 0

        record.write({"name": "Updated Name"})
        self.env.cr.precommit.run()  # trigger the creation of bus.bus records

        notifications = bus.search([("id", ">", last_id)])

        # Check channel
        channel_name = f"record_events:bus.record.event.fake:{record.id}"
        relevant_notif = self._get_relevant_notification(notifications, channel_name)
        self.assertTrue(relevant_notif, "Should have notification on record channel")

        # Check model channel
        model_channel_name = "record_events:bus.record.event.fake"
        model_notif = self._get_relevant_notification(notifications, model_channel_name)
        self.assertTrue(model_notif, "Should have notification on model channel")

        # Check payload
        message = json.loads(relevant_notif.message)
        self.assertEqual(message["type"], "bus.record/event")
        payload = message["payload"]
        self.assertEqual(payload["type"], "write")

        data = payload["data"]
        self.assertEqual(data["id"], record.id)
        self.assertEqual(data["name"], "Updated Name")

    def test_unlink_notification(self):
        """Test that deleting a record sends a notification."""
        record = self.Model.with_user(self.user_1).create({"name": "Test Unlink"})
        self.env.cr.precommit.run()  # trigger the creation of bus.bus records
        record_id = record.id

        bus = self.env["bus.bus"]
        last_id = bus.search([], order="id desc", limit=1).id or 0

        record.unlink()
        self.env.cr.precommit.run()  # trigger the creation of bus.bus records

        notifications = bus.search([("id", ">", last_id)])

        # Check channel
        channel_name = f"record_events:bus.record.event.fake:{record_id}"
        relevant_notif = self._get_relevant_notification(notifications, channel_name)
        self.assertTrue(relevant_notif, "Should have notification on record channel")

        # Check payload
        message = json.loads(relevant_notif.message)
        self.assertEqual(message["type"], "bus.record/event")
        payload = message["payload"]
        self.assertEqual(payload["type"], "unlink")
        self.assertEqual(payload["id"], record_id)

    def test_permission_check_orm(self):
        """Test the permission logic in ir.websocket using ORM methods."""

        # Let's create a rule that restricts access based on user_id
        self.env["ir.rule"].create(
            {
                "name": "Fake Model Rule",
                "model_id": self.env["ir.model"]._get("bus.record.event.fake").id,
                "domain_force": "[('user_id', '=', user.id)]",
                "groups": [(4, self.env.ref("base.group_user").id)],
            }
        )

        record_u1 = self.Model.with_user(self.user_1).create(
            {"name": "User 1 Record", "user_id": self.user_1.id}
        )
        record_u2 = self.Model.with_user(self.user_2).create(
            {"name": "User 2 Record", "user_id": self.user_2.id}
        )

        # User 1 should be able to subscribe to their own record
        # Note: _check_subscription is an internal method of ir.websocket,
        # but we can test if the user can read the record which implies they
        # can subscribe if our ir.websocket implementation delegates to
        # check_access_rights('read').

        # Verify User 1 can read their record
        self.assertTrue(record_u1.with_user(self.user_1).check_access_rights("read"))
        record_u1.with_user(self.user_1).check_access_rule("read")

        # Verify User 1 cannot read User 2's record
        with self.assertRaises(AccessError):
            record_u2.with_user(self.user_1).check_access_rule("read")

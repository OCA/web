import json
from datetime import timedelta
from unittest.mock import patch

from odoo import fields
from odoo.tests import TransactionCase, tagged

from odoo.addons.bus.models.bus import channel_with_db, json_dump

from ..models import bus_bus
from ..models.base import NOTIFICATION_TYPE, record_events_channel
from ..models.ir_model import (
    PARAM_ALLOWED_MODELS,
    PARAM_DENIED_MODELS,
    PARAM_IGNORED_FIELDS,
)


@tagged("post_install", "-at_install")
class TestRecordEvents(TransactionCase):
    def setUp(self):
        super().setUp()
        self.env.cr.precommit.run()
        self.last_bus_id = self.env["bus.bus"].sudo()._bus_last_id()
        self.Partner = self.env["res.partner"]

    def set_param(self, key, value):
        self.env["ir.config_parameter"].sudo().set_param(key, value)

    def events(self, model_name="res.partner"):
        self.env.cr.precommit.run()
        channel = json_dump(
            channel_with_db(self.env.cr.dbname, record_events_channel(model_name))
        )
        rows = (
            self.env["bus.bus"]
            .sudo()
            .search(
                [("id", ">", self.last_bus_id), ("channel", "=", channel)], order="id"
            )
        )
        self.last_bus_id = max(self.last_bus_id, *rows.ids, 0)
        messages = [json.loads(row.message) for row in rows]
        self.assertTrue(all(m["type"] == NOTIFICATION_TYPE for m in messages))
        return [m["payload"] for m in messages]

    def enabled_models(self):
        return self.env["ir.model"]._bus_record_events_enabled_models()

    def test_models_with_a_window_action_are_enabled(self):
        enabled = self.enabled_models()
        self.assertIn("res.partner", enabled)
        self.assertNotIn("bus.bus", enabled)
        self.assertNotIn("ir.ui.view", enabled, "built-in denylist")
        self.assertNotIn("base.module.upgrade", enabled, "transient model")

    def test_denied_models_parameter(self):
        self.set_param(PARAM_DENIED_MODELS, "res.partner, res.country*")
        enabled = self.enabled_models()
        self.assertNotIn("res.partner", enabled)
        self.assertNotIn("res.country", enabled)

    def test_allowed_models_parameter_overrides_builtin_denylist(self):
        self.set_param(PARAM_ALLOWED_MODELS, "ir.ui.view")
        self.assertIn("ir.ui.view", self.enabled_models())

    def test_class_attribute_forces_the_answer(self):
        self.patch(type(self.Partner), "_bus_record_events", False)
        self.env.registry.clear_cache()
        self.assertNotIn("res.partner", self.enabled_models())

        self.patch(type(self.env["ir.ui.view"]), "_bus_record_events", True)
        self.env.registry.clear_cache()
        self.assertIn("ir.ui.view", self.enabled_models())

    def test_one_event_per_model_per_transaction(self):
        first = self.Partner.create({"name": "First"})
        first.write({"name": "First renamed"})
        second, third = self.Partner.create([{"name": "Second"}, {"name": "Third"}])
        existing = self.Partner.create({"name": "Existing"})
        self.events()

        existing.write({"name": "Existing renamed"})
        fourth = self.Partner.create({"name": "Fourth"})
        fourth.write({"name": "Fourth renamed"})
        (first | second).unlink()

        self.assertEqual(
            self.events(),
            [
                {
                    "model": "res.partner",
                    "created": [fourth.id],
                    "written": [existing.id],
                    "unlinked": sorted([first.id, second.id]),
                }
            ],
        )
        self.assertTrue(third.exists())

    def test_payload_carries_no_field_values(self):
        partner = self.Partner.create({"name": "Secret"})
        self.events()
        partner.write({"name": "Still secret", "comment": "private note"})
        (payload,) = self.events()
        self.assertEqual(set(payload), {"model", "created", "written", "unlinked"})
        self.assertNotIn("secret", json.dumps(payload).lower())

    def test_ignored_fields_alone_do_not_emit(self):
        partner = self.Partner.create({"name": "Tracked"})
        self.events()
        self.set_param(PARAM_IGNORED_FIELDS, json.dumps({"res.partner": ["comment"]}))

        partner.write({"comment": "noise"})
        self.assertEqual(self.events(), [])

        partner.write({"comment": "noise", "name": "Signal"})
        self.assertEqual(self.events()[0]["written"], [partner.id])

    def test_ignored_fields_class_attributes_add_up_across_modules(self):
        partner_classes = [
            cls
            for cls in type(self.Partner).__mro__
            if getattr(cls, "_inherit", None) == "res.partner"
            or getattr(cls, "_name", None) == "res.partner"
        ]
        first, second = partner_classes[-1], partner_classes[-2]
        # The classes modules define do not inherit from ``base``, so the
        # attribute does not exist on them until a module sets it.
        for cls, ignored in ((first, ("comment",)), (second, ("ref",))):
            self.startPatcher(
                patch.object(
                    cls, "_bus_record_events_ignored_fields", ignored, create=True
                )
            )
        self.env.registry.clear_cache()
        self.assertTrue(
            {"comment", "ref"}
            <= self.env["ir.model"]._bus_record_events_get_ignored_fields("res.partner")
        )

    def test_invalid_ignored_fields_parameter_is_ignored(self):
        partner = self.Partner.create({"name": "Tracked"})
        self.events()
        self.set_param(PARAM_IGNORED_FIELDS, "{not json")
        with self.assertLogs("odoo.addons.bus_record_events", level="WARNING"):
            partner.write({"comment": "still an event"})
        self.assertEqual(self.events()[0]["written"], [partner.id])

    def test_large_batches_ask_for_a_reload(self):
        self.patch(bus_bus, "MAX_IDS_PER_EVENT", 2)
        self.Partner.create([{"name": f"Partner {i}"} for i in range(3)])
        self.assertEqual(self.events(), [{"model": "res.partner", "reload": True}])

    def test_context_flag_disables_events(self):
        self.Partner.with_context(bus_record_events_disable=True).create(
            {"name": "Quiet"}
        )
        self.assertEqual(self.events(), [])

    def test_denied_model_does_not_emit(self):
        self.set_param("bus_record_events.test", "1")
        self.assertEqual(self.events("ir.config_parameter"), [])

    def test_empty_write_does_not_emit(self):
        partner = self.Partner.create({"name": "Unchanged"})
        self.events()
        partner.write({})
        self.assertEqual(self.events(), [])

    def test_gc_deletes_only_expired_record_events(self):
        Bus = self.env["bus.bus"].sudo()
        Bus._sendone(record_events_channel("res.partner"), NOTIFICATION_TYPE, {})
        Bus._sendone("other_channel", "other_type", {})
        self.env.cr.precommit.run()
        rows = Bus.search([("id", ">", self.last_bus_id)])
        old = fields.Datetime.now() - timedelta(hours=1)
        self.env.cr.execute(
            "UPDATE bus_bus SET create_date = %s WHERE id IN %s", (old, tuple(rows.ids))
        )
        self.env.invalidate_all()

        Bus._gc_record_events()

        remaining = Bus.search([("id", ">", self.last_bus_id)])
        self.assertEqual(len(remaining), 1)
        self.assertIn("other_channel", remaining.channel)

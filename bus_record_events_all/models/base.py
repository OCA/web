from lxml import etree

from odoo import api, models


class Base(models.AbstractModel):
    _inherit = "base"

    def create(self, vals_list):
        records = super().create(vals_list)
        if self._should_notify_bus():
            self.env["bus.record.event.mixin"]._notify_bus_static(records, "create")
        return records

    def write(self, vals):
        res = super().write(vals)
        if self._should_notify_bus():
            self.env["bus.record.event.mixin"]._notify_bus_static(self, "write", vals)
        return res

    def unlink(self):
        should_notify = self._should_notify_bus()
        notifications = []
        if should_notify:
            notifications = self.env[
                "bus.record.event.mixin"
            ]._prepare_unlink_notifications_static(self)

        res = super().unlink()

        if should_notify and notifications:
            self.env["bus.bus"]._sendmany(notifications)

        return res

    @api.model
    def get_view(self, view_id=None, view_type="form", **options):
        result = super().get_view(view_id=view_id, view_type=view_type, **options)

        view_type_mapping = {
            "tree": "bus_record_event_list",
            "list": "bus_record_event_list",
            "form": "bus_record_event_form",
            "kanban": "bus_record_event_kanban",
            "calendar": "bus_record_event_calendar",
            "pivot": "bus_record_event_pivot",
            "graph": "bus_record_event_graph",
        }

        if js_class := view_type_mapping.get(view_type):
            doc = etree.XML(result["arch"])
            doc.set("js_class", js_class)
            result["arch"] = etree.tostring(doc, encoding="unicode")

        return result

    def _should_notify_bus(self):
        # Exclude technical models or models that shouldn't broadcast
        if self._name in ["bus.bus", "bus.presence", "ir.websocket", "ir.logging"]:
            return False
        # Maybe exclude transient models?
        if self.is_transient():
            return False
        return True

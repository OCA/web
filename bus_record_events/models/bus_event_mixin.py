from odoo import Command, api, models


class BusRecordEventMixin(models.AbstractModel):
    _name = "bus.record.event.mixin"
    _description = "Mixin to broadcast CRUD events"

    @api.model_create_multi
    def create(self, vals_list):
        records = super().create(vals_list)
        self._notify_bus_static(records, "create")
        return records

    def write(self, vals):
        res = super().write(vals)
        self._notify_bus_static(self, "write", vals)
        return res

    def unlink(self):
        notifications = self._prepare_unlink_notifications_static(self)
        res = super().unlink()
        if notifications:
            self.env["bus.bus"]._sendmany(notifications)
        return res

    @api.model
    def _notify_bus_static(self, records, event_type, vals=None):
        """Static-like method to be called from other models."""
        if records._name in ["bus.bus", "bus.presence", "ir.websocket"]:
            return

        notifications = []
        for record in records:
            # Prepare base payload for model channel (lightweight)
            model_payload = {
                "model": records._name,
                "type": event_type,
                "data": {"id": record.id},
            }
            model_channel = self._get_bus_channel_name_static(records._name)
            notifications.append((model_channel, "bus.record/event", model_payload))

            # Check if we need to send detailed data to the record channel
            if self._check_add_event_data(event_type, vals):
                if hasattr(record, "_get_bus_event_data"):
                    event_data = record._get_bus_event_data(record, event_type, vals)
                else:
                    event_data = self._get_bus_event_data_static(
                        record, event_type, vals
                    )

                record_payload = model_payload.copy()
                record_payload["data"] = event_data
                record_channel = self._get_bus_channel_name_static(
                    records._name, record.id
                )
                notifications.append(
                    (record_channel, "bus.record/event", record_payload)
                )

        if notifications:
            self.env["bus.bus"]._sendmany(notifications)

    @api.model
    def _check_add_event_data(self, event_type, vals=None):
        """Check if the model requires additional event data."""
        return event_type == "write"

    @api.model
    def _prepare_unlink_notifications_static(self, records):
        if records._name in ["bus.bus", "bus.presence", "ir.websocket"]:
            return []

        ids = records.ids
        notifications = []
        model_channel = self._get_bus_channel_name_static(records._name)
        model_payload = {
            "model": records._name,
            "type": "unlink",
            "ids": ids,
        }
        notifications.append((model_channel, "bus.record/event", model_payload))

        for record_id in ids:
            channel = self._get_bus_channel_name_static(records._name, record_id)
            payload = {
                "model": records._name,
                "type": "unlink",
                "id": record_id,
            }
            notifications.append((channel, "bus.record/event", payload))
        return notifications

    @api.model
    def _get_bus_channel_name_static(self, model_name, record_id=None):
        if record_id:
            return f"record_events:{model_name}:{record_id}"
        return f"record_events:{model_name}"

    @api.model
    def _sanitize_event_values(self, record, vals):
        """Sanitize values to avoid sending large binary data or raw commands."""
        res = {}
        for key, value in vals.items():
            if key not in record._fields:
                res[key] = value
                continue

            field = record._fields[key]

            if field.type == "binary" and value:
                res[key] = "<binary_data>"

            elif field.type == "many2one" and isinstance(value, int) and value:
                # Resolve Many2one ID to (ID, Name) for frontend convenience
                related_record = record.env[field.comodel_name].browse(value)
                res[key] = (
                    related_record.id if related_record.exists() else None,
                    related_record.display_name,
                )

            elif field.type in ("one2many", "many2many") and value:
                # If value contains commands, return the full list of IDs
                if self._is_x2many_command(value):
                    res[key] = getattr(record, key).ids
                else:
                    res[key] = value
            else:
                res[key] = value
        return res

    @api.model
    def _is_x2many_command(self, value):
        """Check if the value contains Odoo x2many commands."""
        if not isinstance(value, list | tuple):
            return False
        for item in value:
            if (
                isinstance(item, list | tuple)
                and len(item) >= 1
                and item[0]
                in (
                    Command.CREATE,
                    Command.UPDATE,
                    Command.DELETE,
                    Command.UNLINK,
                    Command.LINK,
                    Command.CLEAR,
                    Command.SET,
                )
            ):
                return True
        return False

    @api.model
    def _get_bus_event_data_static(self, record, event_type, vals=None):
        data = {
            "id": record.id,
        }

        if event_type != "create":
            if vals:
                data.update(self._sanitize_event_values(record, vals))
            if "display_name" not in data:
                data.update({"display_name": record.display_name})
        return data

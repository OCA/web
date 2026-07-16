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

        model_name = records._name
        model_channel = self._get_bus_channel_name_static(model_name)
        notifications = []
        send_detail = self._check_add_event_data(event_type, vals)

        if event_type == "create":
            # Emit one model-channel notification per batch
            notifications.append(
                (
                    model_channel,
                    "bus.record/event",
                    {
                        "model": model_name,
                        "type": "create",
                        "data": {"ids": records.ids},
                    },
                )
            )
        else:
            # Prefetch display_name for the whole recordset
            if send_detail and vals and "display_name" not in vals:
                records.mapped("display_name")

            # Prefetch Many2one display_names in batch
            m2o_cache = {}
            if send_detail and vals:
                m2o_cache = self._prefetch_m2o_display_names(records, vals)

            for record in records:
                notifications.append(
                    (
                        model_channel,
                        "bus.record/event",
                        {
                            "model": model_name,
                            "type": event_type,
                            "data": {"id": record.id},
                        },
                    )
                )

                if send_detail:
                    if hasattr(record, "_get_bus_event_data"):
                        event_data = record._get_bus_event_data(
                            record, event_type, vals
                        )
                    else:
                        event_data = self._get_bus_event_data_static(
                            record, event_type, vals, m2o_cache=m2o_cache
                        )

                    record_channel = self._get_bus_channel_name_static(
                        model_name, record.id
                    )
                    notifications.append(
                        (
                            record_channel,
                            "bus.record/event",
                            {
                                "model": model_name,
                                "type": event_type,
                                "data": event_data,
                            },
                        )
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

        model_name = records._name
        ids = records.ids
        model_channel = self._get_bus_channel_name_static(model_name)
        notifications = [
            (
                model_channel,
                "bus.record/event",
                {"model": model_name, "type": "unlink", "ids": ids},
            )
        ]

        for record_id in ids:
            notifications.append(
                (
                    self._get_bus_channel_name_static(model_name, record_id),
                    "bus.record/event",
                    {"model": model_name, "type": "unlink", "id": record_id},
                )
            )
        return notifications

    @api.model
    def _get_bus_channel_name_static(self, model_name, record_id=None):
        if record_id:
            return f"record_events:{model_name}:{record_id}"
        return f"record_events:{model_name}"

    @api.model
    def _prefetch_m2o_display_names(self, records, vals):
        """Batch-read Many2one display_names to avoid N+1 queries."""
        if not records:
            return {}

        sample = records[0]
        ids_by_comodel = {}
        for key, value in vals.items():
            if key not in sample._fields:
                continue
            field = sample._fields[key]
            if field.type == "many2one" and isinstance(value, int) and value:
                ids_by_comodel.setdefault(field.comodel_name, set()).add(value)

        cache = {}
        for comodel, ids in ids_by_comodel.items():
            recs = records.env[comodel].browse(list(ids)).exists()
            for rec in recs:
                cache[(comodel, rec.id)] = rec.display_name
        return cache

    @api.model
    def _sanitize_event_values(self, record, vals, m2o_cache=None):
        """Sanitize values to avoid sending large binary data or raw commands."""
        if m2o_cache is None:
            m2o_cache = {}

        res = {}
        for key, value in vals.items():
            if key not in record._fields:
                res[key] = value
                continue

            field = record._fields[key]

            if field.type == "binary" and value:
                res[key] = "<binary_data>"

            elif field.type == "many2one" and isinstance(value, int) and value:
                cached = m2o_cache.get((field.comodel_name, value))
                if cached is not None:
                    res[key] = (value, cached)
                else:
                    related_record = record.env[field.comodel_name].browse(value)
                    res[key] = (
                        related_record.id if related_record.exists() else None,
                        related_record.display_name,
                    )

            elif field.type in ("one2many", "many2many") and value:
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
    def _get_bus_event_data_static(self, record, event_type, vals=None, m2o_cache=None):
        data = {"id": record.id}

        if event_type != "create":
            if vals:
                data.update(self._sanitize_event_values(record, vals, m2o_cache))
            if "display_name" not in data:
                data["display_name"] = record.display_name
        return data

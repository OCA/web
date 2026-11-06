from datetime import timedelta

from odoo import api, fields, models
from odoo.tools import SQL

from .base import (
    CHANNEL_PREFIX,
    MAX_IDS_PER_EVENT,
    NOTIFICATION_TYPE,
    record_events_channel,
)

PARAM_RETENTION_MINUTES = "bus_record_events.retention_minutes"
DEFAULT_RETENTION_MINUTES = 15


class BusBus(models.Model):
    _inherit = "bus.bus"

    @api.model
    def _bus_record_events_send(self, pending):
        """Send one ``bus.record/event`` per model in ``pending``.

        The payload carries ids only, never field values: the subscription check
        only proves the listener can read the model, not every record or field.
        """
        for model_name, operations in pending.items():
            unlinked = operations["unlinked"]
            created = operations["created"] - unlinked
            written = operations["written"] - unlinked - created
            payload = {"model": model_name}
            if len(created) + len(written) + len(unlinked) > MAX_IDS_PER_EVENT:
                payload["reload"] = True
            else:
                payload.update(
                    created=sorted(created),
                    written=sorted(written),
                    unlinked=sorted(unlinked),
                )
            self._sendone(record_events_channel(model_name), NOTIFICATION_TYPE, payload)

    @api.model
    def _gc_record_events(self):
        """Delete record events sooner than the generic bus retention.

        The core garbage collector keeps rows for a day so offline clients can
        catch up on chat. A record event is useless after a few minutes, and
        every first poll scans ``bus_bus`` by ``create_date``.
        """
        minutes = int(
            self.env["ir.config_parameter"]
            .sudo()
            .get_param(PARAM_RETENTION_MINUTES, DEFAULT_RETENTION_MINUTES)
        )
        cutoff = fields.Datetime.now() - timedelta(minutes=minutes)
        escaped_prefix = CHANNEL_PREFIX.replace("_", r"\_")
        self.env.cr.execute(
            SQL(
                "DELETE FROM bus_bus WHERE channel LIKE %s AND create_date < %s",
                f'%"{escaped_prefix}%',
                cutoff,
            )
        )

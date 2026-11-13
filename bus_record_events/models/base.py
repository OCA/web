from collections import defaultdict

from odoo import api, models

CHANNEL_PREFIX = "record_events:"
NOTIFICATION_TYPE = "bus.record/event"
PENDING_KEY = "bus_record_events.pending"
OPERATIONS = ("created", "written", "unlinked")

# Above this many ids for one model in one transaction, the payload asks clients
# to reload instead of listing ids. Keeps imports and mass actions from writing
# a huge bus row that every open view then parses.
MAX_IDS_PER_EVENT = 1000


def record_events_channel(model_name):
    return f"{CHANNEL_PREFIX}{model_name}"


class Base(models.AbstractModel):
    _inherit = "base"

    # None: decided by ir.model._bus_record_events_enabled_models(). True or False:
    # always or never broadcast this model, whatever the configuration.
    _bus_record_events = None
    # Fields whose writes alone are not worth a refresh, such as GPS coordinates
    # that a mobile app writes every few seconds.
    _bus_record_events_ignored_fields = ()

    @api.model_create_multi
    def create(self, vals_list):
        records = super().create(vals_list)
        if records and records._bus_record_events_active():
            records._bus_record_events_queue("created")
        return records

    def write(self, vals):
        res = super().write(vals)
        if (
            self
            and self._bus_record_events_active()
            and self._bus_record_events_relevant_write(vals)
        ):
            self._bus_record_events_queue("written")
        return res

    def unlink(self):
        # Queue before super(): the ids are gone afterwards. A failed unlink rolls
        # the transaction back, and the precommit queue with it.
        if self and self._bus_record_events_active():
            self._bus_record_events_queue("unlinked")
        return super().unlink()

    def _bus_record_events_active(self) -> bool:
        # registry.ready is False while modules install or upgrade, when every
        # data file would otherwise emit events nobody is listening to.
        if not self.env.registry.ready or self.env.context.get(
            "bus_record_events_disable"
        ):
            return False
        return self._name in self.env["ir.model"]._bus_record_events_enabled_models()

    def _bus_record_events_relevant_write(self, vals) -> bool:
        ignored = self.env["ir.model"]._bus_record_events_get_ignored_fields(self._name)
        return any(field_name not in ignored for field_name in vals)

    def _bus_record_events_queue(self, operation):
        """Collect ids per model, to send one event per model at commit.

        Sending from create/write/unlink directly would write one bus row per
        call; a transaction touching a model a hundred times would wake every
        listener a hundred times.
        """
        precommit = self.env.cr.precommit
        pending = precommit.data.get(PENDING_KEY)
        if pending is None:
            pending = precommit.data[PENDING_KEY] = defaultdict(
                lambda: {operation: set() for operation in OPERATIONS}
            )
            env = self.env

            @precommit.add
            def send_record_events():
                env["bus.bus"].sudo()._bus_record_events_send(
                    precommit.data.pop(PENDING_KEY, {})
                )

        pending[self._name][operation].update(self.ids)

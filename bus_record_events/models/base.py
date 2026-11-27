from collections import defaultdict

from odoo import api, models
from odoo.http import request

CHANNEL_PREFIX = "record_events:"
NOTIFICATION_TYPE = "bus.record/event"
PENDING_KEY = "bus_record_events.pending"
OPERATIONS = ("created", "written", "unlinked")
# Member of the JSON-RPC envelope, next to ``params``, that the web client sets
# to a random value per browser tab, so a tab can skip the events its own
# requests caused. Not a context key: the context is copied into the actions
# and filters the server returns, and into the RPC cache key of the client.
TOKEN_KEY = "bus_record_events_token"
MAX_TOKEN_LENGTH = 64

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
        # Queue only once the delete succeeded: a caller may catch the error
        # without a savepoint and commit, and open forms would then be told
        # that a record still in the database was deleted.
        active = self and self._bus_record_events_active()
        res = super().unlink()
        if active:
            self._bus_record_events_queue("unlinked")
        return res

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
                lambda: {
                    **{operation: set() for operation in OPERATIONS},
                    "origins": set(),
                }
            )
            env = self.env

            @precommit.add
            def send_record_events():
                env["bus.bus"].sudo()._bus_record_events_send(
                    precommit.data.pop(PENDING_KEY, {})
                )

        pending[self._name][operation].update(self.ids)
        pending[self._name]["origins"].add(self._bus_record_events_origin())

    def _bus_record_events_origin(self) -> str:
        """The browser tab that caused this change, or "" when unknown.

        The value comes from the request, so a client can send any token, even
        one it read in another tab's events. The most that does is stop that tab
        from refreshing for this client's own changes; it reveals no data.
        """
        token = self._bus_record_events_request_token()
        if isinstance(token, str) and 0 < len(token) <= MAX_TOKEN_LENGTH:
            return token
        return ""

    @api.model
    def _bus_record_events_request_token(self):
        if not request:
            return None
        jsonrequest = getattr(request.dispatcher, "jsonrequest", None)
        if not isinstance(jsonrequest, dict):
            return None
        return jsonrequest.get(TOKEN_KEY)

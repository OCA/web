import logging
from collections import defaultdict

from odoo import models

_logger = logging.getLogger(__name__)

RECORD_EVENT_PREFIX = "record_events:"


class IrWebsocket(models.AbstractModel):
    _inherit = "ir.websocket"

    def _build_bus_channel_list(self, channels):
        allowed = self._filter_record_event_channels(
            [c for c in channels if self._is_record_event_channel(c)]
        )
        valid_channels = [
            channel
            for channel in channels
            if not self._is_record_event_channel(channel) or channel in allowed
        ]
        return super()._build_bus_channel_list(valid_channels)

    def _is_record_event_channel(self, channel):
        return isinstance(channel, str) and channel.startswith(RECORD_EVENT_PREFIX)

    def _filter_record_event_channels(self, channels):
        """Return the subset of ``record_events:`` channels the user may listen to.

        Channels are grouped by model so that each model costs a bounded number
        of queries regardless of how many records are subscribed. The clients of
        this module subscribe one channel per visible record and resend the whole
        channel list on every ``subscribe`` frame, so checking them one by one
        made a dashboard cost one query per record on every resubscription.

        :param channels: list of raw channel strings.
        :return: set of the channel strings that passed the permission check.
        """
        record_ids_by_model = defaultdict(set)
        model_wide = set()
        for channel in channels:
            parsed = self._parse_record_event_channel(channel)
            if not parsed:
                continue
            model_name, res_id = parsed
            if res_id is None:
                model_wide.add(model_name)
            else:
                record_ids_by_model[model_name].add(res_id)

        allowed = set()
        # A model-wide channel carries the ids of every written record, so it is
        # restricted to internal users. Per-record channels are not: they only
        # expose records the user is allowed to read anyway.
        if self.env.user._is_internal():
            allowed.update(
                f"{RECORD_EVENT_PREFIX}{model_name}"
                for model_name in model_wide
                if self._can_read_model(model_name)
            )

        for model_name, res_ids in record_ids_by_model.items():
            if not self._can_read_model(model_name):
                continue
            allowed.update(
                f"{RECORD_EVENT_PREFIX}{model_name}:{res_id}"
                for res_id in self._filter_readable_ids(model_name, res_ids)
            )
        return allowed

    def _parse_record_event_channel(self, channel):
        """Split a channel into ``(model_name, res_id)``.

        ``res_id`` is None for a model-wide channel. Returns None when the
        channel is malformed or names a model that is not in the registry.
        """
        parts = channel.split(":")
        if len(parts) not in (2, 3) or parts[1] not in self.env:
            return None
        if len(parts) == 2:
            return parts[1], None
        try:
            return parts[1], int(parts[2])
        except ValueError:
            return None

    def _can_read_model(self, model_name):
        return self.env[model_name].check_access_rights("read", raise_exception=False)

    def _filter_readable_ids(self, model_name, res_ids):
        """Ids among ``res_ids`` whose record rules allow reading, in one query.

        ``_filter_access_rules`` resolves the rules in SQL, so it neither loads
        the records' field values into the ORM cache nor raises on ids that no
        longer exist -- both of which matter here, where this runs inside the
        long-lived websocket process.
        """
        records = self.env[model_name].browse(res_ids)
        try:
            return records._filter_access_rules("read").ids
        except Exception:
            # Never let one model bring down the whole subscription: the client
            # would lose every other channel, chat and presence included.
            _logger.warning(
                "bus_record_events: could not check record rules on %s, "
                "dropping %s channel(s)",
                model_name,
                len(res_ids),
                exc_info=True,
            )
            return []

    def _check_record_event_permission(self, channel):
        """Single channel check, kept for backward compatibility."""
        return channel in self._filter_record_event_channels([channel])

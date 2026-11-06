from odoo import models

from .base import CHANNEL_PREFIX


class IrWebsocket(models.AbstractModel):
    _inherit = "ir.websocket"

    def _build_bus_channel_list(self, channels):
        requested = {
            channel
            for channel in channels
            if isinstance(channel, str) and channel.startswith(CHANNEL_PREFIX)
        }
        if requested:
            allowed = self._bus_record_events_allowed_channels(requested)
            channels = [
                channel
                for channel in channels
                if channel not in requested or channel in allowed
            ]
        return super()._build_bus_channel_list(channels)

    def _bus_record_events_allowed_channels(self, channels) -> set:
        """Subset of ``record_events:<model>`` channels the user may listen to.

        Only internal users, and only models they can read: the payload lists the
        ids of every changed record of the model, whatever the record rules. The
        check is model-level ACL only, served from the ``ir.model.access`` cache,
        so it costs no query when the client resubscribes.
        """
        if not self.env.user._is_internal():
            return set()
        enabled = self.env["ir.model"]._bus_record_events_enabled_models()
        allowed = set()
        for channel in channels:
            model_name = channel.removeprefix(CHANNEL_PREFIX)
            if model_name in enabled and self.env[model_name].has_access("read"):
                allowed.add(channel)
        return allowed

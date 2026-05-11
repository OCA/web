from odoo import models


class IrWebsocket(models.AbstractModel):
    _inherit = "ir.websocket"

    def _build_bus_channel_list(self, channels):
        valid_channels = []
        for channel in channels:
            if isinstance(channel, str) and channel.startswith("record_events:"):
                if self._check_record_event_permission(channel):
                    valid_channels.append(channel)
            else:
                valid_channels.append(channel)
        return super()._build_bus_channel_list(valid_channels)

    def _check_record_event_permission(self, channel):
        parts = channel.split(":")
        if len(parts) < 2:
            return False

        model_name = parts[1]
        if model_name not in self.env:
            return False

        if len(parts) == 2:  # record_events:model
            if not self.env.user._is_internal():
                return False
            # Check model read access
            try:
                self.env[model_name].check_access_rights("read")
                return True
            except Exception:
                return False
        elif len(parts) == 3:  # record_events:model:id
            try:
                res_id = int(parts[2])
                record = self.env[model_name].browse(res_id)
                record.check_access_rights("read")
                record.check_access_rule("read")
                return True
            except Exception:
                return False
        return False

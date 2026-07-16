from odoo import models
from odoo.tools import index_exists


class BusBus(models.Model):
    _inherit = "bus.bus"

    def init(self):
        index_1 = "idx_bus_bus_channel_id"
        if not index_exists(self._cr, index_1):
            self._cr.execute(
                "CREATE INDEX idx_bus_bus_channel_id " "ON bus_bus (channel, id);"
            )

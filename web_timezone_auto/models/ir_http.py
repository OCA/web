# Copyright 2026 Altixia (https://www.altixia.com)
# @author: Claude Perrin <claude@altixia.com>
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

from odoo import models


class IrHttp(models.AbstractModel):
    _inherit = "ir.http"

    def session_info(self):
        # The web client only compares time zones when the user follows the device.
        info = super().session_info()
        info["tz_auto"] = bool(self.env.user.tz_auto)
        return info

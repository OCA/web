# Copyright 2021 Sergey Shebanin
# License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl.html).

from odoo import models


class IrHttp(models.AbstractModel):
    _inherit = "ir.http"

    def session_info(self):
        result = super().session_info()
        if self.env.user.has_group("web_refresh.group_watch_changes"):
            result["wr_watch"] = True
        if self.env.user.has_group("web_refresh.group_allow_refresh_every"):
            result["wr_every"] = [
                int(
                    self.env["ir.config_parameter"]
                    .sudo()
                    .get_param("web_refresh.default_refresh_every")
                ),
                int(
                    self.env["ir.config_parameter"]
                    .sudo()
                    .get_param("web_refresh.min_refresh_every")
                ),
            ]
        return result

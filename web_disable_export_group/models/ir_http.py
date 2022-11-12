# Copyright 2018 Tecnativa - David Vidal
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from odoo import models
from odoo.http import request


class Http(models.AbstractModel):
    _inherit = "ir.http"

    def session_info(self):
        res = super().session_info()
        user = request.env.user
        res.update(
            {
                "group_export_data": user
                and user.has_group("web_disable_export_group.group_export_data"),
            }
        )
        return res

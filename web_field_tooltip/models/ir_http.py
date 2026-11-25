# Copyright 2023 ACSONE SA/NV
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

from odoo import models


class Http(models.AbstractModel):
    _inherit = "ir.http"

    def session_info(self):
        result = super().session_info()
        user = self.env.user
        result.update(
            {
                "can_manage_tooltips": user._is_tooltip_manager(),
                "tooltip_show_add_helper": user.tooltip_show_add_helper,
            }
        )
        return result

# Copyright 2026 Quartile (https://www.quartile.co)
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

from odoo import models


class IrHttp(models.AbstractModel):
    _inherit = "ir.http"

    def session_info(self):
        result = super().session_info()
        company = self.env.company
        result["web_m2x_dialog_no_create"] = {
            "allowed_models": company.m2x_dialog_create_model_ids.mapped("model"),
        }
        return result

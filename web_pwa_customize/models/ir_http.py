# Copyright 2026 Exo Software
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
from odoo import models


class IrHttp(models.AbstractModel):
    _inherit = "ir.http"

    def webclient_rendering_context(self):
        result = super().webclient_rendering_context()
        result["pwa_theme_color"] = (
            self.env["ir.config_parameter"].sudo().get_param("pwa.manifest.theme_color")
        )
        return result

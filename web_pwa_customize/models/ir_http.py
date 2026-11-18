# Copyright 2026 Exo Software
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
from odoo import models


class IrHttp(models.AbstractModel):
    _inherit = "ir.http"

    def webclient_rendering_context(self):
        result = super().webclient_rendering_context()
        icp = self.env["ir.config_parameter"].sudo()
        result["pwa_theme_color"] = icp.get_param("pwa.manifest.theme_color")
        result["pwa_short_name"] = icp.get_param("pwa.manifest.short_name")
        # iOS takes the home screen icon and name from these tags, not the manifest
        icon_url = self.env["res.config.settings"]._pwa_icon_url_base + "512x512.png"
        result["pwa_apple_touch_icon"] = (
            self.env["ir.attachment"]
            .sudo()
            .search([("url", "=", icon_url)], limit=1)
            .url
        )
        return result

# Copyright 2024 Tecnativa - Víctor Martínez
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
from odoo import models
from odoo.http import request


class IrHttp(models.AbstractModel):
    _inherit = "ir.http"

    def webclient_rendering_context(self):
        result = super().webclient_rendering_context()
        icp = request.env["ir.config_parameter"].sudo()
        pwa_icon_attachment = (
            request.env["ir.attachment"]
            .sudo()
            .search([("url", "like", "/web_pwa_customize/icon")], limit=1)
        )
        result.update(
            {
                "manifest_theme_color": icp.get_param(
                    "pwa.manifest.theme_color", "#71639e"
                ),
                "manifest_short_name": icp.get_param("pwa.manifest.short_name", "Odoo"),
                "manifest_apple_touch_icon": pwa_icon_attachment.url
                if pwa_icon_attachment
                else "/web/static/img/odoo-icon-ios.png",
            }
        )
        return result

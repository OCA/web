# Copyright 2024 Tecnativa - Víctor Martínez
# License AGPL-3.0 or later (http://www.gnu.org/licenses/lgpl).

from odoo.http import request

from odoo.addons.web.controllers.webmanifest import WebManifest


class WebManifest(WebManifest):
    def _get_pwa_manifest_icons(self, pwa_icon):
        icons = []
        if not pwa_icon.mimetype.startswith("image/svg"):
            all_icons = (
                request.env["ir.attachment"]
                .sudo()
                .search(
                    [
                        ("url", "like", "/web_pwa_customize/icon"),
                        (
                            "url",
                            "not like",
                            "/web_pwa_customize/icon.",
                        ),  # Get only resized icons
                    ]
                )
            )
            for icon in all_icons:
                icon_size_name = icon.url.split("/")[-1].lstrip("icon").split(".")[0]
                icons.append(
                    {"src": icon.url, "sizes": icon_size_name, "type": icon.mimetype}
                )
        else:
            icons = [
                {
                    "src": pwa_icon.url,
                    "sizes": "128x128 144x144 152x152 192x192 256x256 512x512",
                    "type": pwa_icon.mimetype,
                }
            ]
        return icons

    def _get_webmanifest(self):
        manifest = super()._get_webmanifest()
        icp = request.env["ir.config_parameter"].sudo()

        # Override with custom values
        manifest["short_name"] = icp.get_param(
            "pwa.manifest.short_name", manifest.get("short_name", "Odoo")
        )
        manifest["background_color"] = icp.get_param(
            "pwa.manifest.background_color", "#714B67"
        )
        manifest["theme_color"] = icp.get_param("pwa.manifest.theme_color", "#714B67")

        # Handle custom icons
        pwa_icon = (
            request.env["ir.attachment"]
            .sudo()
            .search([("url", "like", "/web_pwa_customize/icon.")], limit=1)
        )
        if pwa_icon:
            manifest["icons"] = self._get_pwa_manifest_icons(pwa_icon)

        return manifest

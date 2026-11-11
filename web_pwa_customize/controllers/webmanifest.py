# Copyright 2024 Tecnativa - Víctor Martínez
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).
import json

from odoo import http
from odoo.http import request
from odoo.tools import ustr

from odoo.addons.web.controllers import webmanifest

# iOS Safari's "Add to Home Screen" reads a single apple-touch-icon link
# tag, not the PWA manifest's icons array, so it needs one fixed image
# rather than a list of sizes. None of the sizes this module generates
# (128 up to 512) is the platform's own recommended 180x180, so 192x192 -
# the closest larger one - is tried first, then whatever else exists.
APPLE_TOUCH_ICON_SIZES = [
    "192x192",
    "256x256",
    "152x152",
    "144x144",
    "128x128",
    "512x512",
]


class WebManifest(webmanifest.WebManifest):
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

    def _get_apple_touch_icon_attachment(self):
        """The best-fitting configured icon for iOS's apple-touch-icon, or
        None if no custom icon has been uploaded at all."""
        pwa_icon = (
            request.env["ir.attachment"]
            .sudo()
            .search([("url", "like", "/web_pwa_customize/icon.")])
        )
        if not pwa_icon:
            return None
        if pwa_icon.mimetype.startswith("image/svg"):
            return pwa_icon
        sized_icons = (
            request.env["ir.attachment"]
            .sudo()
            .search(
                [
                    ("url", "like", "/web_pwa_customize/icon"),
                    ("url", "not like", "/web_pwa_customize/icon."),
                ]
            )
        )
        by_url = {icon.url: icon for icon in sized_icons}
        for size in APPLE_TOUCH_ICON_SIZES:
            icon = by_url.get(f"/web_pwa_customize/icon{size}.png")
            if icon:
                return icon
        return pwa_icon

    @http.route(
        "/web_pwa_customize/apple_touch_icon",
        type="http",
        auth="public",
        readonly=True,
    )
    def apple_touch_icon(self):
        """iOS Safari's "Add to Home Screen" reads the apple-touch-icon
        link tag, not the PWA manifest - redirect it to whichever
        configured icon fits best, falling back to Odoo's own artwork if
        nothing has been configured."""
        icon = self._get_apple_touch_icon_attachment()
        if not icon:
            return request.redirect("/web/static/img/odoo-icon-ios.png")
        return request.redirect(icon.url)

    @http.route(
        "/web/manifest.webmanifest",
        type="http",
        auth="public",
        methods=["GET"],
        readonly=True,
    )
    def webmanifest(self):
        """Call super and overwrite the values that we want."""
        res = super().webmanifest()
        manifest = json.loads(res.response[0])
        icp = request.env["ir.config_parameter"].sudo()
        manifest["short_name"] = icp.get_param("pwa.manifest.short_name", "Odoo")
        manifest["background_color"] = icp.get_param(
            "pwa.manifest.background_color", "#714B67"
        )
        manifest["theme_color"] = icp.get_param("pwa.manifest.theme_color", "#714B67")
        pwa_icon = (
            request.env["ir.attachment"]
            .sudo()
            .search([("url", "like", "/web_pwa_customize/icon.")])
        )
        if pwa_icon:
            manifest["icons"] = self._get_pwa_manifest_icons(pwa_icon)
        body = json.dumps(manifest, default=ustr)
        return request.make_response(
            body,
            [
                ("Content-Type", "application/manifest+json"),
            ],
        )

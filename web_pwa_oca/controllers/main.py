# Copyright 2020 Lorenzo Battistini @ TAKOBI
# Copyright 2020 Tecnativa - Alexandre D. Díaz
# Copyright 2020 Tecnativa - João Marques
# License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl).
import json

from odoo.http import Controller, request, route

from ..models.res_config_settings import PWA_ICON_SIZES


class PWA(Controller):
    def _get_pwa_manifest_icons(self, pwa_icon):
        icons = []
        if not pwa_icon:
            for size in PWA_ICON_SIZES:
                icons.append(
                    {
                        "src": "/web_pwa_oca/static/img/icons/icon-%sx%s.png"
                        % (str(size[0]), str(size[1])),
                        "sizes": "{}x{}".format(str(size[0]), str(size[1])),
                        "type": "image/png",
                    }
                )
        elif not pwa_icon.mimetype.startswith("image/svg"):
            all_icons = (
                request.env["ir.attachment"]
                .sudo()
                .search(
                    [
                        ("url", "like", "/web_pwa_oca/icon"),
                        (
                            "url",
                            "not like",
                            "/web_pwa_oca/icon.",
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
                    "sizes": " ".join(
                        map(
                            lambda size: "{}x{}".format(size[0], size[1]),
                            PWA_ICON_SIZES,
                        )
                    ),
                    "type": pwa_icon.mimetype,
                    "purpose": "any maskable",
                }
            ]
        return icons

    def _get_pwa_manifest(self):
        """Webapp manifest"""
        config_param_sudo = request.env["ir.config_parameter"].sudo()
        pwa_name = config_param_sudo.get_param("pwa.manifest.name", "Odoo PWA")
        pwa_short_name = config_param_sudo.get_param(
            "pwa.manifest.short_name", "Odoo PWA"
        )
        pwa_icon = (
            request.env["ir.attachment"]
            .sudo()
            .search([("url", "like", "/web_pwa_oca/icon.")])
        )
        background_color = config_param_sudo.get_param(
            "pwa.manifest.background_color", "#2E69B5"
        )
        theme_color = config_param_sudo.get_param("pwa.manifest.theme_color", "#2E69B5")
        return {
            "name": pwa_name,
            "short_name": pwa_short_name,
            "icons": self._get_pwa_manifest_icons(pwa_icon),
            "start_url": "/web",
            "display": "standalone",
            "background_color": background_color,
            "theme_color": theme_color,
        }

    @route("/web_pwa_oca/manifest.webmanifest", type="http", auth="public")
    def pwa_manifest(self):
        """Returns the manifest used to install the page as app"""
        return request.make_response(
            json.dumps(self._get_pwa_manifest()),
            headers=[("Content-Type", "application/json;charset=utf-8")],
        )

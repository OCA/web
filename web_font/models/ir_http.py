# Copyright 2026 Ecosoft Co., Ltd. (https://ecosoft.co.th)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

import re

from odoo import api, models

FONT_FACE_RE = re.compile(r"@font-face\s*\{[^}]*\}")
FONT_FAMILY_RE = re.compile(r"font-family:\s*['\"]?([^;'\"}]+)")
FONT_SRC_RE = re.compile(r"src:\s*([^;}]+)")
FONT_WEIGHT_RE = re.compile(r"font-weight:\s*([^;}]+)")
FONT_STYLE_RE = re.compile(r"font-style:\s*([^;}]+)")


class IrHttp(models.AbstractModel):
    _inherit = "ir.http"

    def session_info(self):
        res = super().session_info()
        res["web_font"] = self.sudo()._get_web_font_info()
        return res

    @api.model
    def _get_web_font_info(self):
        """Return the font to load in the web client (see web_font.esm.js)"""
        ICP = self.env["ir.config_parameter"].sudo()
        font = ICP.get_str("web_font.font")
        if font not in self.env["res.company"]._fields["font"].get_values(self.env):
            return False
        bundle = self.env["ir.qweb"]._get_asset_bundle(
            "web.report_assets_common", js=False
        )
        faces = self._get_web_font_faces(font, bundle.get_version("css"))
        return {
            "family": font,
            "faces": [
                {"src": src, "weight": weight, "style": style}
                for src, weight, style in faces
            ],
            "size": ICP.get_int("web_font.size"),
        }

    @api.model
    @api.ormcache("font", "version")
    def _get_web_font_faces(self, font, version):
        """Document Layout fonts are only declared in the report assets.
        Take the @font-face rules of the chosen font from there, so any font
        available for the reports can be used in the backend as well."""
        bundle = self.env["ir.qweb"]._get_asset_bundle(
            "web.report_assets_common", js=False
        )
        faces = []
        for face in FONT_FACE_RE.findall(bundle.css().raw.decode()):
            family = FONT_FAMILY_RE.search(face)
            if not family or family.group(1).strip() != font:
                continue
            weight = FONT_WEIGHT_RE.search(face)
            style = FONT_STYLE_RE.search(face)
            faces.append(
                (
                    # The last src is the one used by the browsers
                    FONT_SRC_RE.findall(face)[-1].strip(),
                    weight.group(1).strip() if weight else "normal",
                    style.group(1).strip() if style else "normal",
                )
            )
        return tuple(faces)

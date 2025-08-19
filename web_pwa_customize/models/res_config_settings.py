# Copyright 2024 Tecnativa - Víctor Martínez
# License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl).
import base64
import io
import sys

from PIL import Image

from odoo import _, api, exceptions, fields, models
from odoo.tools.mimetypes import guess_mimetype


class ResConfigSettings(models.TransientModel):
    _inherit = "res.config.settings"
    _pwa_icon_url_base = "/web_pwa_customize/icon"

    pwa_short_name = fields.Char(
        "Web App Short Name",
        config_parameter="pwa.manifest.short_name",
    )
    pwa_icon = fields.Binary("Icon", readonly=False)
    pwa_background_color = fields.Char(
        "Background Color", config_parameter="pwa.manifest.background_color"
    )
    pwa_theme_color = fields.Char(
        "Theme Color", config_parameter="pwa.manifest.theme_color"
    )

    @api.model
    def get_values(self):
        res = super().get_values()
        pwa_icon_attachment = (
            self.env["ir.attachment"]
            .sudo()
            .search([("url", "like", self._pwa_icon_url_base + ".")])
        )
        res["pwa_icon"] = pwa_icon_attachment.datas if pwa_icon_attachment else False
        return res

    @api.model
    def default_get(self, fields):
        res = super().default_get(fields)
        for f_name in ["pwa_background_color", "pwa_theme_color"]:
            if f_name in fields and not res.get(f_name):
                res[f_name] = "#714B67"
        return res

    def _unpack_icon(self, icon):
        # Wrap decoded_icon in BytesIO object
        decoded_icon = base64.b64decode(icon)
        icon_bytes = io.BytesIO(decoded_icon)
        return Image.open(icon_bytes)

    def _write_icon_to_attachment(self, extension, mimetype, size=None):
        url = self._pwa_icon_url_base + extension
        icon = self.pwa_icon
        # Resize image
        if size:
            image = self._unpack_icon(icon)
            resized_image = image.resize(size)
            icon_bytes_output = io.BytesIO()
            resized_image.save(icon_bytes_output, format=extension.lstrip(".").upper())
            icon = base64.b64encode(icon_bytes_output.getvalue())
            url = f"{self._pwa_icon_url_base}{str(size[0])}x{str(size[1])}{extension}"
        # Retreive existing attachment
        attachment_model = self.env["ir.attachment"].sudo()
        attachment = attachment_model.search([("url", "like", url)])
        # Write values to ir_attachment
        values = {
            "datas": icon,
            "db_datas": icon,
            "url": url,
            "name": url,
            "type": "binary",
            "mimetype": mimetype,
        }
        # Rewrite if exists, else create
        if attachment:
            attachment.sudo().write(values)
        else:
            attachment_model.create(values)

    @api.model
    def set_values(self):
        res = super().set_values()
        # Retrieve previous value for pwa_icon from ir_attachment
        pwa_icon_ir_attachments = (
            self.env["ir.attachment"]
            .sudo()
            .search([("url", "like", self._pwa_icon_url_base)])
        )
        # Delete or ignore if no icon provided
        if not self.pwa_icon:
            if pwa_icon_ir_attachments:
                pwa_icon_ir_attachments.unlink()
            return res
        # Fail if icon provided is larger than 2mb
        if sys.getsizeof(self.pwa_icon) > 2196608:
            raise exceptions.UserError(
                _("You can't upload a file with more than 2 MB.")
            )
        # Confirm if the pwa_icon binary content is an SVG or PNG
        # and process accordingly
        decoded_pwa_icon = base64.b64decode(self.pwa_icon)
        # Full mimetype detection
        pwa_icon_mimetype = guess_mimetype(decoded_pwa_icon)
        pwa_icon_extension = "." + pwa_icon_mimetype.split("/")[-1].split("+")[0]
        if not pwa_icon_mimetype.startswith(
            "image/svg"
        ) and not pwa_icon_mimetype.startswith("image/png"):
            raise exceptions.UserError(
                _("You can only upload SVG or PNG files. Found: %s.")
                % pwa_icon_mimetype
            )
        # Delete all previous records if we are writting new ones
        if pwa_icon_ir_attachments:
            pwa_icon_ir_attachments.unlink()
        self._write_icon_to_attachment(pwa_icon_extension, pwa_icon_mimetype)
        # write multiple sizes if not SVG
        if pwa_icon_extension != ".svg":
            # Fail if provided PNG is smaller than 512x512
            if self._unpack_icon(self.pwa_icon).size < (512, 512):
                raise exceptions.UserError(
                    _("You can only upload PNG files bigger than 512x512")
                )
            for size in [
                (128, 128),
                (144, 144),
                (152, 152),
                (192, 192),
                (256, 256),
                (512, 512),
            ]:
                self._write_icon_to_attachment(
                    pwa_icon_extension, pwa_icon_mimetype, size=size
                )

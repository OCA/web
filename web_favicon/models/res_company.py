# Copyright 2015 Therp BV <http://therp.nl>
# Copyright 2016 Pedro M. Baeza
# Copyright 2024 OERP Canada <https://www.oerp.ca>
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

import base64
import hashlib
import io
from random import randrange

from PIL import Image

import odoo
from odoo import api, fields, models, tools
from odoo.http import request


class ResCompany(models.Model):
    _inherit = "res.company"

    def _get_default_favicon(self, original=False):
        img_path = odoo.tools.misc.file_path("web/static/img/favicon.ico")
        with tools.file_open(img_path, "rb") as f:
            if original:
                return base64.b64encode(f.read())
            # Modify the source image to add a colored bar on the bottom
            # This could seem overkill to modify the pixels 1 by 1, but
            # Pillow doesn't provide an easy way to do it, and this
            # is acceptable for a 16x16 image.
            color = (
                randrange(32, 224, 24),
                randrange(32, 224, 24),
                randrange(32, 224, 24),
            )
            original = Image.open(f)
            new_image = Image.new("RGBA", original.size)
            height = original.size[1]
            width = original.size[0]
            bar_size = 1
            for y in range(height):
                for x in range(width):
                    pixel = original.getpixel((x, y))
                    if height - bar_size <= y + 1 <= height:
                        new_image.putpixel((x, y), (color[0], color[1], color[2], 255))
                    else:
                        new_image.putpixel(
                            (x, y), (pixel[0], pixel[1], pixel[2], pixel[3])
                        )
            stream = io.BytesIO()
            new_image.save(stream, format="ICO")
            return base64.b64encode(stream.getvalue())

    favicon = fields.Binary(
        string="Company Favicon",
        help="This field holds the image used to display favicon for a given company.",
        default=_get_default_favicon,
    )

    @api.model_create_multi
    def create(self, vals_list):
        # add default favicon
        for vals in vals_list:
            if not vals.get("favicon"):
                vals["favicon"] = self._get_default_favicon()
        return super().create(vals_list)

    # Get favicon from current company
    @api.model
    def _get_favicon(self):
        """Returns a local url that points to the image field of a given record."""
        company_id = (
            request.httprequest.cookies.get("cids")
            if request.httprequest.cookies.get("cids")
            else False
        )
        company = (
            self.browse(int(company_id.split(",")[0])).sudo()
            if company_id and self.browse(int(company_id.split(",")[0])).sudo().favicon
            else False
        )
        if company:
            sha = hashlib.sha512(str(company.write_date).encode("utf-8")).hexdigest()[
                :7
            ]
            return f"/web/image/{self._name}/{company_id}/favicon?unique={sha}"
        else:
            return False

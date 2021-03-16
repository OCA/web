# Copyright 2020 Tecnativa - Alexandre D. Díaz
# License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl).
from odoo import fields, models


class ProductProduct(models.Model):
    _inherit = "product.product"

    image_variant_medium = fields.Binary(
        "Variant Image Medium (Related)",
        related="image_512",
        help="This field holds the image used as image for the product variant"
        "or product image medium, limited to 512x512px.",
    )

    image_variant_big = fields.Binary(
        "Variant Image Big (Related)",
        related="image_1024",
        help="This field holds the image used as image for the product variant"
        "or product image, limited to 1024x1024px.",
    )

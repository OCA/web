# Copyright 2020 Tecnativa - Alexandre D. Díaz
# License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl).
from odoo import api, fields, models, tools


class ProductProduct(models.Model):
    _inherit = 'product.product'

    image_variant_medium = fields.Binary(
        "Variant Image Medium (Computed)",
        compute='_compute_variant_image',
        help="This field holds the image used as image for the product variant"
             "or product image medium, limited to 512x512px.",
    )

    image_variant_big = fields.Binary(
        "Variant Image Big (Computed)",
        compute='_compute_variant_image',
        help="This field holds the image used as image for the product variant"
             "or product image, limited to 1024x1024px.",
    )

    @api.depends('image_variant', 'product_tmpl_id.image')
    def _compute_variant_image(self):
        for record in self:
            if record.image_variant:
                resized_images = tools.image_get_resized_images(
                    record.image_variant,
                    return_big=False,
                    return_small=False,
                    avoid_resize_medium=True)
                record.image_variant_medium = resized_images['image_medium']
                record.image_variant_big = record.image_variant
            else:
                record.image_variant_medium = record.product_tmpl_id.image_medium
                record.image_variant_big = record.product_tmpl_id.image

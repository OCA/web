# Part of Odoo. See LICENSE file for full copyright and licensing details.
from odoo import models


class ProductTemplate(models.Model):
    _inherit = "product.template"

    def _get_combination_info_image(self, combination_info):
        if combination_info["product_id"]:
            product = (
                self.env["product.product"]
                .sudo()
                .browse(combination_info["product_id"])
            )
            if product:
                return self.env["website"].image_url(product, "image_256", size=256)
        return ""

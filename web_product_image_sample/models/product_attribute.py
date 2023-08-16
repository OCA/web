from odoo import fields, models


class ProductAttribute(models.Model):
    _inherit = "product.attribute"

    display_type = fields.Selection(
        selection_add=[("image", "Product image")],
        ondelete={"image": lambda recs: recs.write({"display_type": "radio"})},
    )

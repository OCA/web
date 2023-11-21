# Copyright 2020 Tecnactiva - Alexandre Díaz
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).
from odoo import fields, models


class ProductSecondaryUnit(models.Model):
    _inherit = "product.secondary.unit"

    product_variant_ids = fields.One2many(
        related="product_tmpl_id.product_variant_ids", store=False, readonly=True
    )

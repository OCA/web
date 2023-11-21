# Copyright 2020 Tecnactiva - Alexandre Díaz
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).
from odoo import fields, models


class SaleOrderLine(models.Model):
    _inherit = "sale.order.line"

    product_id_secondary_uom_ids = fields.One2many(
        related="product_id.secondary_uom_ids", readonly=True, store=False
    )

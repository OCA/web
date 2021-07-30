# Copyright 2020 Tecnactiva - Alexandre Díaz
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).
from odoo import api, fields, models


class SaleOrderLine(models.Model):
    _inherit = "sale.order.line"

    @api.depends("product_id", "product_id.secondary_uom_ids")
    def _compute_has_secondary_uom(self):
        for record in self:
            record.has_secondary_uom = any(record.product_id.secondary_uom_ids.ids)

    has_secondary_uom = fields.Boolean(
        "Has Secondary UoM", compute="_compute_has_secondary_uom", store=False
    )

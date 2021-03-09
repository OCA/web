# Copyright 2020 Therp BV <https://therp.nl>.
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
"""Demonstratie web_domain_field, making product domain dependent on category."""
import json

from odoo import api, fields, models


class ProductSelectionExample(models.Model):
    """Demonstratie web_domain_field, making product domain dependent on category."""
    _name = "product.selection.example"
    _description = "Show web_domain_field in action"

    @api.multi
    @api.depends("product_category_id")
    def _compute_product_id_domain(self):
        for this in self:
            domain = (
                [("categ_id", "=", this.product_category_id.id)]
                if this.product_category_id
                else []
            )
            this.product_id_domain = json.dumps(domain)

    product_category_id = fields.Many2one(
        comodel_name="product.category",
        required=True
    )
    product_id = fields.Many2one(comodel_name="product.demonstration")
    product_id_domain = fields.Char(
        compute="_compute_product_id_domain",
        readonly=True,
        store=False,
    )

    @api.onchange("product_category_id")
    def _onchange_product_category_id(self):
        """Clear product_id if not in accordance with category."""
        for this in self:
            if (
                    this.product_category_id
                    and this.product_id
                    and this.product_category_id != this.product_id.categ_id
            ):
                no_product = self.env["product.demonstration"].browse([])
                this.product_id = no_product

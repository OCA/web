# Copyright 2020 Therp BV <https://therp.nl>.
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
"""Demonstration products.

We do nut use the normal product.template and product.product models because some
odoo modules had the abhorrent idea of adding required fields to product.template,
like sale_line_warn in the sale module. In order to make this module not dependant
on modules that make the terrible mistake of adding required fields to models
defined in another module, we have our own demo product model.
"""

from odoo import fields, models


class ProductDemonstration(models.Model):
    """Demonstration product. Just for the sake of this module."""
    _name = "product.demonstration"
    _description = "Products to demonstrate workings of web_domain_field module."

    name = fields.Char(required=True)
    default_code = fields.Char(required=True)
    categ_id = fields.Many2one(
        comodel_name="product.category",
        required=True
    )

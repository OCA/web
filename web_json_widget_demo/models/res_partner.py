# Copyright 2025 360ERP (<https://www.360erp.com>)
# License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl).


from odoo import fields, models


class ResPartner(models.Model):
    _inherit = "res.partner"

    demo_json_data = fields.Json(
        string="JSON Data",
        default={"test": "value", "int": 123},
    )

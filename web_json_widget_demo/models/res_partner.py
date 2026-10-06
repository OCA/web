# Copyright 2025 Lambdao
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).


from odoo import fields, models


class ResPartner(models.Model):
    _inherit = "res.partner"

    demo_json_data = fields.Json(
        string="JSON Data",
        default={"test": "value", "int": 123},
    )

# Copyright 2026 Quartile (https://www.quartile.co)
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

from odoo import fields, models


class ResCompany(models.Model):
    _inherit = "res.company"

    m2x_dialog_create_model_ids = fields.Many2many(
        "ir.model",
        relation="res_company_m2x_dialog_create_model_rel",
        column1="company_id",
        column2="model_id",
        string="Allow Create from Search Dialog",
    )

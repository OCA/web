# Copyright 2026 Quartile (https://www.quartile.co)
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

from odoo import fields, models


class ResConfigSettings(models.TransientModel):
    _inherit = "res.config.settings"

    m2x_dialog_create_model_ids = fields.Many2many(
        related="company_id.m2x_dialog_create_model_ids",
        readonly=False,
    )

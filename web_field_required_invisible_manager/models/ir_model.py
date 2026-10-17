# Copyright 2023 ooops404
# License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl.html)
from odoo import fields, models


class IrModel(models.Model):
    _inherit = "ir.model"

    custom_required_restriction_ids = fields.One2many(
        "custom.field.restriction",
        "required_model_id",
    )
    custom_invisible_restriction_ids = fields.One2many(
        "custom.field.restriction",
        "invisible_model_id",
    )
    custom_readonly_restriction_ids = fields.One2many(
        "custom.field.restriction",
        "readonly_model_id",
    )

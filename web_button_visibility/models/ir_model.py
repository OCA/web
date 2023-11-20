# Copyright 2023 ooops404
# License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl.html)


from odoo import fields, models


class IrModel(models.Model):
    _inherit = "ir.model"

    hide_button_rule_ids = fields.One2many(
        "model.button.rule",
        "model_id",
    )

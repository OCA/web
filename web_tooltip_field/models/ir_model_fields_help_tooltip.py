# Copyright 2023 Komit - Cuong Nguyen Mtm
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

from odoo import fields, models


class IrModelFieldsHelpTooltip(models.Model):
    _name = "ir.model.fields.help.tooltip"
    _description = "Help Tooltip for Fields"
    _rec_name = "field_id"

    field_id = fields.Many2one(
        "ir.model.fields", required=True, ondelete="cascade", index=True
    )
    model = fields.Char(related="field_id.model", store=True)
    help = fields.Text(translate=True)

    _sql_constraints = [
        (
            "field_id_uniq",
            "unique(field_id)",
            "Help Tooltip for Field already exists!",
        ),
    ]

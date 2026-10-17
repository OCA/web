# Copyright 2025 ACSONE SA/NV
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

from odoo import fields, models


class IrUiCustomListField(models.Model):
    _name = "ir.ui.custom.list.field"
    _description = "Ir Ui Custom List Field"
    _order = "model_id, sequence,id"

    name = fields.Char(
        required=True,
        translate=True,
        string="Displayed name",
    )
    field_name = fields.Char(
        string="Field name",
        related="field_id.name",
    )
    field_id = fields.Many2one(
        comodel_name="ir.model.fields",
        required=True,
        domain="[('model','=',model_name)]",
        ondelete="cascade",
    )
    sequence = fields.Integer()
    model_name = fields.Char(
        string="Model Name",
        related="model_id.model",
        store=True,
        readonly=True,
        index=True,
    )
    model_id = fields.Many2one(
        comodel_name="ir.model",
        required=True,
        ondelete="cascade",
    )
    position_after = fields.Many2one(
        comodel_name="ir.model.fields",
        help="Optional field name for putting the filter after that one. "
        "If empty or not found, it will be added at the end of the list view.",
        domain="[('model','=',model_name)]",
        ondelete="set null",
    )
    position_after_field_name = fields.Char(
        string="Position after field name",
        related="position_after.name",
    )
    optional = fields.Selection(
        selection=[
            ("not_optional", "Not Optional"),
            ("hide", "Optional: hide"),
            ("display", "Optional: display"),
        ],
        help="Display field as optional in list view or not",
        required=True,
        default="not_optional",
        string="Display setting",
    )

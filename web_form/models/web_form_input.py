# Copyright 2019 ACSONE SA/NV
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

from odoo import _, api, fields, models
from odoo.exceptions import ValidationError


class WebFormInput(models.Model):
    _name = "web.form.input"
    _inherit = "web.form.line"
    _description = "Web Form Input"
    _order = "sequence"

    name = fields.Char(required=True)
    label = fields.Char(required=True)
    sequence = fields.Integer(default=10)
    required = fields.Boolean()
    readonly = fields.Boolean()
    input_type = fields.Selection(
        string="Type",
        selection=[
            ("text", "Text"),
            ("email", "Email"),
            ("number", "number"),
            ("date", "Date"),
            ("textarea", "Textarea"),
            ("freetext", "Free text"),
        ],
        required=True,
    )
    _sql_constraints = [
        ("name_unique_by_form", "unique (form_id, name)", "Name must be unique!")
    ]

    @api.onchange("input_type")
    def _onchange_input_type(self):
        for rec in self:
            rec.update(
                {
                    "required": False,
                    "readonly": False,
                    "value": False,
                    "field_id": False,
                }
            )

    def _need_check_value(self):
        res = super()._need_check_value()
        return res and self.input_type != "freetext"

    @api.constrains("input_type", "field_id")
    def _check_input_type(self):
        for rec in self.filtered("field_id"):
            if rec.input_type in ("text", "email") and rec.field_id.ttype != "char":
                raise ValidationError(
                    _("Text or email inputs must be mapped to Char type fields")
                )
            if rec.input_type == "textarea" and rec.field_id.ttype not in (
                "text",
                "html",
            ):
                raise ValidationError(
                    _("Text area inputs must be mapped to Text or Html type fields")
                )

            if rec.input_type == "number" and rec.field_id.ttype not in (
                "integer",
                "float",
            ):
                raise ValidationError(
                    _("Number inputs must be mapped to float or integer type fields")
                )

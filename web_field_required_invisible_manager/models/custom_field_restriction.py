# Copyright 2020 ooops404
# License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl.html)
from odoo import api, fields, models


class CustomFieldRestriction(models.Model):
    _name = "custom.field.restriction"
    _description = "Make field invisible or required"

    field_id = fields.Many2one(
        "ir.model.fields",
        ondelete="cascade",
        required=True,
        string="Field",
    )

    field_name = fields.Char(
        related="field_id.name",
        store=True,
        string="Field Name",
    )

    required_model_id = fields.Many2one(
        "ir.model",
        ondelete="cascade",
        string="required_model_id",
        index=True,
    )
    invisible_model_id = fields.Many2one(
        "ir.model",
        ondelete="cascade",
        string="invisible_model_id",
        index=True,
    )

    model_name = fields.Char(
        compute="_compute_model_name",
        store=True,
        string="Model Name",
        index=True,
    )
    condition_domain = fields.Char()
    group_ids = fields.Many2many("res.groups", required=True)
    required = fields.Boolean()
    default_required = fields.Boolean(related="field_id.required")
    invisible = fields.Boolean()

    @api.onchange("field_id")
    def onchange_field_id(self):
        self.required = self.field_id.required

    @api.depends("required_model_id", "invisible_model_id")
    def _compute_model_name(self):
        for rec in self:
            if rec.required_model_id:
                rec.model_name = rec.required_model_id.model
            elif rec.invisible_model_id:
                rec.model_name = rec.invisible_model_id.model

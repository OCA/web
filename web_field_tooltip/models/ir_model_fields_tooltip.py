# Copyright 2023 ACSONE SA/NV
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

from odoo import _, api, fields, models
from odoo.exceptions import UserError


class IrModelFieldsTooltip(models.Model):

    _name = "ir.model.fields.tooltip"
    _description = "Field Tooltip"

    model_id = fields.Many2one(
        string="Model",
        comodel_name="ir.model",
        ondelete="cascade",
        required=True,
        help="Model for the Field Tooltip.",
        default=lambda self: self._get_default_model_id(),
    )
    model = fields.Char(related="model_id.model", string="Model Name")
    field_id = fields.Many2one(
        string="Field",
        required=True,
        comodel_name="ir.model.fields",
        ondelete="cascade",
    )
    name = fields.Char(compute="_compute_name", readonly=True,)
    active = fields.Boolean(
        default=True,
        help="Set active to false to hide the Tooltip without removing it.",
    )
    field_name = fields.Char(related="field_id.name")
    tooltip_text = fields.Html(string="Tooltip Text")

    @api.constrains("model_id", "field_id")
    def _check_duplicate_tooltip(self):
        for rec in self:
            if self.search(
                [
                    ("model_id", "=", rec.model_id.id),
                    ("field_id", "=", rec.field_id.id),
                    ("id", "!=", rec.id),
                ]
            ):
                raise UserError(_("A tooltip already exists for this field"))

    def _get_default_model_id(self):
        tooltip_model = self.env.context.get("tooltip_model")
        model = self.env["ir.model"].search([("model", "=", tooltip_model)], limit=1)
        return model.id or False

    @api.depends("model_id", "field_id")
    def _compute_name(self):
        for tooltip in self:
            tooltip.name = "Tooltip for {} on {}".format(
                tooltip.field_id.name, tooltip.model_id.name
            )

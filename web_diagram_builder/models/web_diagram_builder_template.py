# Copyright 2024 TechnoLibre
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

from odoo import api, fields, models


class WebDiagramBuilderTemplate(models.Model):
    _name = "web.diagram.builder.template"
    _description = "Web Diagram Builder Template"
    _order = "name"

    name = fields.Char(required=True)
    model_id = fields.Many2one(
        "ir.model",
        string="Model",
        required=True,
        ondelete="cascade",
    )
    model_name = fields.Char(
        related="model_id.model",
        string="Model Technical Name",
        readonly=True,
        store=True,
    )
    recursive_field_id = fields.Many2one(
        "ir.model.fields",
        string="Parent Field",
        required=True,
        domain="[('model_id', '=', model_id), ('ttype', '=', 'many2one'), "
               "('relation', '=', model_name)]",
        ondelete="cascade",
        help="The field that links a record to its parent. Must be a Many2one "
             "pointing to the same model (e.g. parent_id on Contact).",
    )
    description = fields.Text()

    @api.onchange("model_id")
    def _onchange_model_id(self):
        if self.recursive_field_id and self.recursive_field_id.model_id != self.model_id:
            self.recursive_field_id = False

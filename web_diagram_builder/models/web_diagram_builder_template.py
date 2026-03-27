# Copyright 2024 TechnoLibre
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

from odoo import fields, models


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
    recursive_field_id = fields.Many2one(
        "ir.model.fields",
        string="Recursive Field",
        required=True,
        domain="[('model_id', '=', model_id), ('ttype', '=', 'many2one'), "
               "('relation', '=', model_id.model)]",
        ondelete="cascade",
        help="Many2one field on the model that points back to the same model "
             "(e.g. parent_id on res.partner).",
    )
    description = fields.Text()

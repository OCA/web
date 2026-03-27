# Copyright 2024 TechnoLibre
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

from odoo import fields, models


class WebDiagramBuilderLink(models.Model):
    _name = "web.diagram.builder.link"
    _description = "Web Diagram Builder Link"
    _order = "builder_id, source_node_id"

    builder_id = fields.Many2one(
        "web.diagram.builder",
        string="Builder",
        required=True,
        ondelete="cascade",
        index=True,
    )
    source_node_id = fields.Many2one(
        "web.diagram.builder.node",
        string="Source",
        required=True,
        ondelete="cascade",
        index=True,
    )
    dest_node_id = fields.Many2one(
        "web.diagram.builder.node",
        string="Destination",
        required=True,
        ondelete="cascade",
        index=True,
    )
    signal = fields.Char(string="Label")

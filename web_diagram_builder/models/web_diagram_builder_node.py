# Copyright 2024 TechnoLibre
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

from odoo import fields, models, api


class WebDiagramBuilderNode(models.Model):
    _name = "web.diagram.builder.node"
    _description = "Web Diagram Builder Node"
    _order = "builder_id, name"

    builder_id = fields.Many2one(
        "web.diagram.builder",
        string="Builder",
        required=True,
        ondelete="cascade",
        index=True,
    )
    name = fields.Char(required=True)
    record_id = fields.Integer(
        string="Record",
        help="ID of the real record this node represents.",
    )
    flow_start = fields.Boolean(
        string="Root Node",
        help="Root nodes have no parent and appear as starting points in the diagram.",
    )
    def action_open_record(self):
        self.ensure_one()
        return {
            "type": "ir.actions.act_window",
            "res_model": self.builder_id.model_id.model,
            "res_id": self.record_id,
            "views": [(False, "form")],
            "target": "current",
        }

    # ── One2many fields required by web_diagram's graph_get algorithm ──
    # dest_field  = outgoing links (this node is the source/parent)
    outgoing_link_ids = fields.One2many(
        "web.diagram.builder.link",
        "source_node_id",
        string="Outgoing Links",
    )
    # source_field = incoming links (this node is the destination/child)
    incoming_link_ids = fields.One2many(
        "web.diagram.builder.link",
        "dest_node_id",
        string="Incoming Links",
    )

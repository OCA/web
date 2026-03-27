# Copyright 2024 TechnoLibre
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

from odoo import api, fields, models
from odoo.tools.safe_eval import safe_eval


class WebDiagramBuilder(models.Model):
    _name = "web.diagram.builder"
    _description = "Web Diagram Builder"
    _order = "name"

    name = fields.Char(required=True)
    model_id = fields.Many2one(
        "ir.model",
        string="Model",
        required=True,
        ondelete="cascade",
    )
    # Stored so the domain widget can reference it via options={'model': 'model_name'}
    model_name = fields.Char(
        related="model_id.model",
        string="Model Technical Name",
        readonly=True,
        store=True,
    )
    recursive_field_id = fields.Many2one(
        "ir.model.fields",
        string="Recursive Field",
        required=True,
        domain="[('model_id', '=', model_id), ('ttype', '=', 'many2one'), "
               "('relation', '=', model_id.model)]",
        ondelete="cascade",
        help="Many2one field on the model that points back to the same model. "
             "Used to traverse the dependency chain.",
    )
    filter_domain = fields.Char(
        string="Filter Domain",
        default="[]",
        help="Domain to select the initial set of records. "
             "Parents are automatically included to complete the chain.",
    )
    max_nodes = fields.Integer(
        string="Max Nodes",
        default=200,
        help="Safety limit on the number of nodes. Traversal stops when "
             "this limit is reached.",
    )
    template_id = fields.Many2one(
        "web.diagram.builder.template",
        string="Apply Template",
        ondelete="set null",
        help="Select a template to pre-fill Model and Recursive Field.",
    )
    node_ids = fields.One2many(
        "web.diagram.builder.node",
        "builder_id",
        string="Nodes",
        readonly=True,
    )
    link_ids = fields.One2many(
        "web.diagram.builder.link",
        "builder_id",
        string="Links",
        readonly=True,
    )
    node_count = fields.Integer(
        compute="_compute_counts",
        string="Node Count",
        store=True,
    )
    link_count = fields.Integer(
        compute="_compute_counts",
        string="Link Count",
        store=True,
    )
    last_computed = fields.Datetime(
        string="Last Computed",
        readonly=True,
    )

    @api.depends("node_ids", "link_ids")
    def _compute_counts(self):
        for rec in self:
            rec.node_count = len(rec.node_ids)
            rec.link_count = len(rec.link_ids)

    @api.onchange("template_id")
    def _onchange_template_id(self):
        if self.template_id:
            self.model_id = self.template_id.model_id
            self.recursive_field_id = self.template_id.recursive_field_id

    @api.onchange("model_id")
    def _onchange_model_id(self):
        if self.recursive_field_id and self.recursive_field_id.model_id != self.model_id:
            self.recursive_field_id = False

    def action_compute(self):
        for rec in self:
            rec._compute_diagram()

    def action_compute_all(self):
        """Called by the hourly cron to refresh all builders."""
        self.search([])._compute_diagram()

    def _compute_diagram(self):
        """Recompute nodes and links by traversing the recursive field."""
        self.ensure_one()

        # Remove existing data (links cascade-delete with nodes)
        self.node_ids.unlink()

        if not self.model_id or not self.recursive_field_id:
            return

        Model = self.env[self.model_id.model]
        field_name = self.recursive_field_id.name
        max_nodes = self.max_nodes or 200
        domain = safe_eval(self.filter_domain or "[]")

        # ── BFS upward: start from domain records, follow field_name to root ──
        initial_records = Model.search(domain)
        all_ids = set(initial_records.ids)
        to_process = list(initial_records)
        visited = set()

        while to_process and len(all_ids) < max_nodes:
            rec = to_process.pop(0)
            if rec.id in visited:
                continue
            visited.add(rec.id)
            parent = rec[field_name]
            if parent and parent.id not in all_ids:
                all_ids.add(parent.id)
                to_process.append(parent)

        all_records = Model.browse(list(all_ids))

        # ── Create nodes ──
        nodes_by_record_id = {}
        for rec in all_records:
            parent = rec[field_name]
            node = self.env["web.diagram.builder.node"].create({
                "builder_id": self.id,
                "name": rec.display_name,
                "record_id": rec.id,
                # Root nodes (no parent) are flow_start so the layout
                # algorithm places them as sources (left side of diagram).
                "flow_start": not bool(parent),
            })
            nodes_by_record_id[rec.id] = node.id

        # ── Create links: parent → child (arrows flow from root down) ──
        signal = self.recursive_field_id.field_description or field_name
        for rec in all_records:
            parent = rec[field_name]
            if parent and parent.id in nodes_by_record_id:
                self.env["web.diagram.builder.link"].create({
                    "builder_id": self.id,
                    "source_node_id": nodes_by_record_id[parent.id],
                    "dest_node_id": nodes_by_record_id[rec.id],
                    "signal": signal,
                })

        self.last_computed = fields.Datetime.now()

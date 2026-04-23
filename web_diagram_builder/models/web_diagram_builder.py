# Copyright 2024 TechnoLibre
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

import base64
import csv
import io
import zipfile
from collections import deque

from odoo import api, fields, models
from odoo.tools.safe_eval import safe_eval


class WebDiagramBuilder(models.Model):
    _name = "web.diagram.builder"
    _description = "Web Diagram Builder"
    _order = "name"

    name = fields.Char(required=True)
    description = fields.Text(string="Description")
    model_id = fields.Many2one(
        "ir.model",
        string="Model",
        required=True,
        ondelete="cascade",
        domain=[("has_hierarchy", "=", True)],
        help="The model whose records will be displayed as nodes in the diagram.",
    )
    # Stored so the domain widget can reference it via options={'model': 'model_name'}
    model_name = fields.Char(
        compute="_compute_model_name",
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
    auto_refresh = fields.Boolean(
        string="Auto-refresh",
        default=False,
        help="If enabled, the diagram is automatically recomputed by the "
             "scheduled cron job.",
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
        help="Number of nodes generated in the diagram.",
        store=True,
    )
    link_count = fields.Integer(
        compute="_compute_counts",
        string="Link Count",
        help="Number of links generated in the diagram.",
        store=True,
    )
    last_computed = fields.Datetime(
        string="Last Computed",
        readonly=True,
    )

    @api.depends("model_id")
    def _compute_model_name(self):
        for rec in self:
            rec.model_name = rec.model_id.model or False

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

    def action_export_csv(self):
        self.ensure_one()
        attachment = self.env["ir.attachment"].create({
            "name": f"{self.name}.csv",
            "datas": base64.b64encode(self._build_csv_bytes()),
            "mimetype": "text/csv",
        })
        return {
            "type": "ir.actions.act_url",
            "url": f"/web/content/{attachment.id}?download=true",
            "target": "self",
        }

    def _build_csv_bytes(self):
        """Return the CSV content for a single diagram as bytes."""
        buf = io.StringIO()
        writer = csv.writer(buf)
        writer.writerow(["# DIAGRAM BUILDER CONFIG"])
        writer.writerow(["name", self.name])
        writer.writerow(["model_name", self.model_name or ""])
        writer.writerow(["recursive_field_name", self.recursive_field_id.name or ""])
        writer.writerow(["filter_domain", self.filter_domain or "[]"])
        writer.writerow(["max_nodes", self.max_nodes])
        writer.writerow(["description", self.description or ""])
        parent_map = {
            link.dest_node_id.id: link.source_node_id
            for link in self.link_ids
        }
        writer.writerow(["# NODES"])
        writer.writerow(["record_id", "name", "parent_record_id", "parent_name", "is_root"])
        for node in self.node_ids:
            parent_node = parent_map.get(node.id)
            writer.writerow([
                node.record_id,
                node.name,
                parent_node.record_id if parent_node else "",
                parent_node.name if parent_node else "",
                node.flow_start,
            ])
        return buf.getvalue().encode("utf-8")

    def action_export_csv_multi(self):
        """Export selected diagrams as a ZIP of CSV files."""
        if len(self) == 1:
            return self.action_export_csv()
        zip_buf = io.BytesIO()
        with zipfile.ZipFile(zip_buf, "w", zipfile.ZIP_DEFLATED) as zf:
            names_seen = {}
            for rec in self:
                safe_name = (rec.name or f"diagram_{rec.id}").replace("/", "_")
                count = names_seen.get(safe_name, 0)
                names_seen[safe_name] = count + 1
                filename = f"{safe_name}_{count}.csv" if count else f"{safe_name}.csv"
                zf.writestr(filename, rec._build_csv_bytes())
        zip_bytes = zip_buf.getvalue()
        attachment = self.env["ir.attachment"].create({
            "name": "diagrams_export.zip",
            "datas": base64.b64encode(zip_bytes),
            "mimetype": "application/zip",
        })
        return {
            "type": "ir.actions.act_url",
            "url": f"/web/content/{attachment.id}?download=true",
            "target": "self",
        }

    def action_compute(self):
        self.ensure_one()
        self._compute_diagram()
        self.invalidate_recordset()
        return {
            "type": "ir.actions.client",
            "tag": "display_notification",
            "params": {
                "title": "Diagram computed",
                "message": f"{self.node_count} nodes and {self.link_count} links generated.",
                "type": "success",
                "sticky": False,
                "next": {
                    "type": "ir.actions.act_window",
                    "res_model": self._name,
                    "res_id": self.id,
                    "views": [(False, "form")],
                    "target": "current",
                },
            },
        }

    def action_open_help(self):
        lang = (self.env.lang or self.env.user.lang or "en_US").lower()
        is_fr = lang.startswith("fr")
        HelpModel = self.env["web.diagram.builder.help"]
        content = HelpModel._get_help_html(is_fr)
        rec = HelpModel.create({"content_html": content})
        return {
            "type": "ir.actions.act_window",
            "name": "Comment ça marche ?" if is_fr else "How does the Diagram Builder work?",
            "res_model": "web.diagram.builder.help",
            "res_id": rec.id,
            "view_mode": "form",
            "target": "new",
            "views": [(False, "form")],
        }

    def action_open_diagram(self):
        action = self.env["ir.actions.act_window"]._for_xml_id(
            "web_diagram_builder.action_web_diagram_builder"
        )
        action["res_id"] = self.id
        action["views"] = [(False, "diagram")]
        action["display_name"] = self.name
        return action

    def action_compute_all(self):
        """Recompute diagrams that have auto-refresh enabled. Called by the scheduled task."""
        for rec in self.search([("auto_refresh", "=", True)]):
            rec._compute_diagram()

    def _compute_diagram(self):
        """Recompute nodes and links by traversing the recursive field."""
        self.ensure_one()

        # Remove existing data (links cascade-delete with nodes)
        self.node_ids.unlink()

        if not self.model_id or not self.recursive_field_id:
            return

        if self.model_id.model not in self.env:
            return

        Model = self.env[self.model_id.model]
        field_name = self.recursive_field_id.name
        max_nodes = self.max_nodes or 200
        try:
            domain = safe_eval(self.filter_domain or "[]")
            if not isinstance(domain, list):
                domain = []
        except (ValueError, SyntaxError):
            domain = []

        initial_records = Model.search(domain)
        all_ids = set(initial_records.ids)
        to_process = deque(initial_records)
        visited = set()

        while to_process and len(all_ids) < max_nodes:
            rec = to_process.popleft()
            if rec.id in visited:
                continue
            visited.add(rec.id)
            parent = rec[field_name]
            if parent and parent.id not in all_ids:
                all_ids.add(parent.id)
                to_process.append(parent)

        all_records = Model.browse(list(all_ids))
        nodes_by_record_id = {}
        for rec in all_records:
            parent = rec[field_name]
            node = self.env["web.diagram.builder.node"].create({
                "builder_id": self.id,
                "name": rec.display_name or str(rec.id),
                "record_id": rec.id,
                "flow_start": not bool(parent),
            })
            nodes_by_record_id[rec.id] = node.id

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

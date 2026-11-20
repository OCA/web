# Copyright 2024 TechnoLibre
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

from odoo import api, fields, models


class WebDiagramBuilderPath(models.TransientModel):
    _name = "web.diagram.builder.path"
    _description = "Find Path Between Two Nodes"

    builder_id = fields.Many2one(
        "web.diagram.builder",
        string="Diagram",
        required=True,
    )
    node_a_id = fields.Many2one(
        "web.diagram.builder.node",
        string="From Node",
        domain="[('builder_id', '=', builder_id)]",
    )
    node_b_id = fields.Many2one(
        "web.diagram.builder.node",
        string="To Node",
        domain="[('builder_id', '=', builder_id)]",
    )
    path_html = fields.Html(string="Path", readonly=True, sanitize=False)

    def action_find_path(self):
        self.ensure_one()
        # Build parent map: node_id → parent node
        parent_map = {
            link.dest_node_id.id: link.source_node_id
            for link in self.builder_id.link_ids
        }

        def get_ancestors(node):
            """Return ordered list from node up to root."""
            path = []
            current = node
            visited = set()
            while current and current.id not in visited:
                path.append(current)
                visited.add(current.id)
                current = parent_map.get(current.id)
            return path

        ancestors_a = get_ancestors(self.node_a_id)
        ancestors_b = get_ancestors(self.node_b_id)

        set_a = {n.id: i for i, n in enumerate(ancestors_a)}
        lca = None
        lca_idx_b = 0
        for i, node in enumerate(ancestors_b):
            if node.id in set_a:
                lca = node
                lca_idx_b = i
                break

        if lca is None:
            self.path_html = "<p class='text-danger'>No path found between these two nodes.</p>"
            return self._reopen()

        lca_idx_a = set_a[lca.id]
        path_a = ancestors_a[:lca_idx_a]       # A up to (not including) LCA
        path_b = ancestors_b[:lca_idx_b]       # B up to (not including) LCA
        full_path = path_a + [lca] + list(reversed(path_b))

        # Build HTML
        bubbles = ""
        for i, node in enumerate(full_path):
            if node.id == self.node_a_id.id or node.id == self.node_b_id.id:
                color = "#28a745"   # green for endpoints
            elif node.id == lca.id and lca.id not in (self.node_a_id.id, self.node_b_id.id):
                color = "#fd7e14"   # orange for common ancestor
            else:
                color = "#007bff"   # blue for intermediate nodes

            bubbles += f"""
                <div style="display:inline-flex;flex-direction:column;align-items:center;margin:0 4px;">
                    <div style="
                        background:{color};color:white;border-radius:50%;
                        width:60px;height:60px;display:flex;align-items:center;
                        justify-content:center;text-align:center;font-size:11px;
                        padding:4px;box-sizing:border-box;font-weight:bold;
                        overflow:hidden;word-break:break-word;
                    ">{node.name[:20]}</div>
                </div>
            """
            if i < len(full_path) - 1:
                bubbles += '<div style="display:inline-flex;align-items:center;font-size:20px;color:#666;margin:0 2px;">→</div>'

        steps = len(full_path) - 1
        text_path = " → ".join(n.name for n in full_path)
        html = f"""
        <div style="margin-top:12px;">
            <p><strong>Path ({steps} step{'s' if steps != 1 else ''}):</strong><br/>
            <span style="font-family:monospace;">{text_path}</span></p>
            <div style="display:flex;flex-wrap:wrap;align-items:center;margin-top:12px;padding:12px;
                        background:#f8f9fa;border-radius:8px;">
                {bubbles}
            </div>
            <p style="margin-top:8px;font-size:0.85em;color:#666;">
                🟢 Start/End &nbsp; 🟠 Common ancestor &nbsp; 🔵 Intermediate node
            </p>
        </div>
        """
        self.path_html = html
        return self._reopen()

    def _reopen(self):
        return {
            "type": "ir.actions.act_window",
            "res_model": self._name,
            "res_id": self.id,
            "view_mode": "form",
            "target": "new",
            "views": [(False, "form")],
        }

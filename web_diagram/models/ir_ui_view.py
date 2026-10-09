# Part of Odoo. See LICENSE file for full copyright and licensing details.

from lxml import etree

from odoo import api, fields, models
from odoo.tools.safe_eval import safe_eval

from ..tools.graph import graph

DIAGRAM_VIEW = ("diagram", "Diagram")


class IrUIView(models.Model):
    _inherit = "ir.ui.view"

    type = fields.Selection(selection_add=[DIAGRAM_VIEW])

    def _get_view_info(self):
        result = super()._get_view_info()
        result["diagram"] = {
            "icon": "fa fa-code-fork",
            "multi_record": False,
        }
        return result

    def _postprocess_tag_diagram_element(self, node, name_manager, node_info, wrapper_tag):
        """Postprocess <node> or <arrow> children against their own model."""
        element_model = node.get("object")
        if element_model and element_model in self.env:
            wrapper = etree.Element(wrapper_tag)
            for child in list(node):
                wrapper.append(child)
            self._postprocess_view(wrapper, element_model, editable=False)
            for child in list(wrapper):
                node.append(child)
        node_info["children"] = []
        node_info["editable"] = False

    def _postprocess_tag_node(self, node, name_manager, node_info):
        self._postprocess_tag_diagram_element(node, name_manager, node_info, "_node_wrapper")

    def _postprocess_tag_arrow(self, node, name_manager, node_info):
        self._postprocess_tag_diagram_element(node, name_manager, node_info, "_arrow_wrapper")

    def _validate_tag_diagram_element(self, node, name_manager, node_info):
        """Validate <node> or <arrow> children against their own model."""
        element_model = node.get("object")
        if element_model and element_model in self.env:
            for child in list(node):
                node.remove(child)
                self._validate_view(
                    child, element_model, view_type=child.tag, editable=False,
                    node_info=node_info,
                )

    def _validate_tag_node(self, node, name_manager, node_info):
        self._validate_tag_diagram_element(node, name_manager, node_info)

    def _validate_tag_arrow(self, node, name_manager, node_info):
        self._validate_tag_diagram_element(node, name_manager, node_info)

    def _validate_tag_label(self, node, name_manager, node_info):
        """In a diagram view, <label> is a legend element, not a form label.
        Skip the 'for' requirement that applies to form labels."""
        parent = node.getparent()
        while parent is not None:
            if parent.tag == "diagram":
                return
            parent = parent.getparent()
        return super()._validate_tag_label(node, name_manager, node_info)

    @api.model
    def graph_get(
        self, rec_id, model, node_obj, conn_obj, src_node, des_node, label, scale
    ):
        """Compute the graph layout for a diagram view.

        Ported from Odoo 13 core (removed in Odoo 14 when the diagram
        view was dropped from the standard distribution).
        """

        def rec_name(rec):
            return (
                rec.name
                if "name" in rec
                else rec.x_name
                if "x_name" in rec
                else None
            )

        nodes = []
        nodes_name = []
        transitions = []
        start = []
        tres = {}
        labels = {}
        no_ancestor = []
        blank_nodes = []

        model_env = self.env[model]
        node_env = self.env[node_obj]

        node_field = None
        model_field = None
        source_field = None
        dest_field = None

        for model_key, model_value in model_env._fields.items():
            if model_value.type == "one2many":
                if model_value.comodel_name == node_obj:
                    node_field = model_key
                    model_field = model_value.inverse_name

        for node_key, node_value in node_env._fields.items():
            if node_value.type == "one2many":
                if node_value.comodel_name == conn_obj:
                    if node_value.inverse_name == des_node:
                        source_field = node_key
                    if node_value.inverse_name == src_node:
                        dest_field = node_key

        record = model_env.browse(rec_id)
        for line in record[node_field]:
            if line[source_field] or line[dest_field]:
                nodes_name.append((line.id, rec_name(line)))
                nodes.append(line.id)
            else:
                blank_nodes.append({"id": line.id, "name": rec_name(line)})

            if "flow_start" in line and line.flow_start:
                start.append(line.id)
            elif not line[source_field]:
                no_ancestor.append(line.id)

            for t in line[dest_field]:
                transitions.append((line.id, t[des_node].id))
                tres[str(t["id"])] = (line.id, t[des_node].id)
                label_string = ""
                if label:
                    for lbl in safe_eval(label):
                        if str(lbl) in t and str(t[lbl]) == "False":
                            label_string += " "
                        else:
                            label_string = label_string + " " + str(t[lbl])
                labels[str(t["id"])] = (line.id, label_string)

        g = graph(nodes, transitions, no_ancestor)
        g.process(start)
        g.scale(*scale)
        result = g.result_get()
        results = {}
        for node_id, node_name in nodes_name:
            results[str(node_id)] = result[node_id]
            results[str(node_id)]["name"] = node_name
        return {
            "nodes": results,
            "transitions": tres,
            "label": labels,
            "blank_nodes": blank_nodes,
            "node_parent_field": model_field,
        }

# Part of Odoo. See LICENSE file for full copyright and licensing details.

from odoo import api, fields, models, tools
from ..tools.graph import graph
from odoo.tools.safe_eval import safe_eval

DIAGRAM_VIEW = ("diagram", "Diagram")


class IrUIView(models.Model):
    _inherit = "ir.ui.view"

    type = fields.Selection(selection_add=[DIAGRAM_VIEW])

    def _postprocess_tag_node(self, node, name_manager, node_info):
        """Process <node> children against the node's object model, not the
        parent diagram model.

        In Odoo 15, NameManager takes only the model (no validate flag) and
        postprocess() is gone — _postprocess_view() drives the stack loop.
        We move children into a temporary wrapper, run _postprocess_view on
        it against the node's own model, then move them back.
        """
        node_model = node.get('object')
        if node_model and node_model in self.env:
            from lxml import etree
            wrapper = etree.Element('_node_wrapper')
            for child in list(node):
                wrapper.append(child)  # lxml auto-detaches from node
            self._postprocess_view(wrapper, node_model, editable=False)
            for child in list(wrapper):
                node.append(child)  # lxml auto-detaches from wrapper
        # Prevent parent stack from re-processing children with diagram model
        node_info['children'] = []
        node_info['editable'] = False

    def _postprocess_tag_arrow(self, node, name_manager, node_info):
        """Process <arrow> children against the arrow's object model, not the
        parent diagram model.

        Same Odoo 15 adaptation as _postprocess_tag_node above.
        """
        arrow_model = node.get('object')
        if arrow_model and arrow_model in self.env:
            from lxml import etree
            wrapper = etree.Element('_arrow_wrapper')
            for child in list(node):
                wrapper.append(child)
            self._postprocess_view(wrapper, arrow_model, editable=False)
            for child in list(wrapper):
                node.append(child)
        # Prevent parent stack from re-processing children with diagram model
        node_info['children'] = []
        node_info['editable'] = False

    @api.model
    def graph_get(self, id, model, node_obj, conn_obj, src_node, des_node,
                  label, scale):
        """Compute the graph layout for a diagram view.

        Ported from Odoo 13 core (removed in Odoo 14 when the diagram view
        was dropped from the standard distribution).
        """
        def rec_name(rec):
            return (rec.name if 'name' in rec else
                    rec.x_name if 'x_name' in rec else
                    None)

        nodes = []
        nodes_name = []
        transitions = []
        start = []
        tres = {}
        labels = {}
        no_ancester = []
        blank_nodes = []

        Model = self.env[model]
        Node = self.env[node_obj]

        _Node_Field = None
        _Model_Field = None
        _Source_Field = None
        _Destination_Field = None

        for model_key, model_value in Model._fields.items():
            if model_value.type == 'one2many':
                if model_value.comodel_name == node_obj:
                    _Node_Field = model_key
                    _Model_Field = model_value.inverse_name

        for node_key, node_value in Node._fields.items():
            if node_value.type == 'one2many':
                if node_value.comodel_name == conn_obj:
                    if node_value.inverse_name == des_node:
                        _Source_Field = node_key
                    if node_value.inverse_name == src_node:
                        _Destination_Field = node_key

        record = Model.browse(id)
        for line in record[_Node_Field]:
            if line[_Source_Field] or line[_Destination_Field]:
                nodes_name.append((line.id, rec_name(line)))
                nodes.append(line.id)
            else:
                blank_nodes.append({'id': line.id, 'name': rec_name(line)})

            if 'flow_start' in line and line.flow_start:
                start.append(line.id)
            elif not line[_Source_Field]:
                no_ancester.append(line.id)

            for t in line[_Destination_Field]:
                transitions.append((line.id, t[des_node].id))
                tres[str(t['id'])] = (line.id, t[des_node].id)
                label_string = ""
                if label:
                    for lbl in safe_eval(label):
                        if tools.ustr(lbl) in t and \
                                tools.ustr(t[lbl]) == 'False':
                            label_string += ' '
                        else:
                            label_string = (label_string + " " +
                                            tools.ustr(t[lbl]))
                labels[str(t['id'])] = (line.id, label_string)

        g = graph(nodes, transitions, no_ancester)
        g.process(start)
        g.scale(*scale)
        result = g.result_get()
        results = {}
        for node_id, node_name in nodes_name:
            results[str(node_id)] = result[node_id]
            results[str(node_id)]['name'] = node_name
        return {
            'nodes': results,
            'transitions': tres,
            'label': labels,
            'blank_nodes': blank_nodes,
            'node_parent_field': _Model_Field,
        }

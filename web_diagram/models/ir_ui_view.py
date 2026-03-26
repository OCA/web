# Part of Odoo. See LICENSE file for full copyright and licensing details.

from odoo import fields, models
from odoo.addons.base.models.ir_ui_view import NameManager

DIAGRAM_VIEW = ("diagram", "Diagram")


class IrUIView(models.Model):
    _inherit = "ir.ui.view"

    type = fields.Selection(selection_add=[DIAGRAM_VIEW])

    def _postprocess_tag_node(self, node, name_manager, node_info):
        """Process <node> children against the node's object model, not the
        parent diagram model."""
        node_model = node.get('object')
        if node_model and node_model in self.env:
            sub_nm = NameManager(name_manager.validate, self.env[node_model])
            for child in node:
                self.postprocess(child, [], False, sub_nm)
            if name_manager.validate:
                sub_nm.check_view_fields(self)
        # Prevent postprocess() from re-iterating children with parent manager
        node_info['children'] = []
        node_info['editable'] = False

    def _postprocess_tag_arrow(self, node, name_manager, node_info):
        """Process <arrow> children against the arrow's object model, not the
        parent diagram model."""
        arrow_model = node.get('object')
        if arrow_model and arrow_model in self.env:
            sub_nm = NameManager(name_manager.validate, self.env[arrow_model])
            # source/destination attrs are field names on the arrow model
            if node.get('source'):
                sub_nm.has_field(node.get('source'), {})
            if node.get('destination'):
                sub_nm.has_field(node.get('destination'), {})
            for child in node:
                self.postprocess(child, [], False, sub_nm)
            if name_manager.validate:
                sub_nm.check_view_fields(self)
        # Prevent postprocess() from re-iterating children with parent manager
        node_info['children'] = []
        node_info['editable'] = False

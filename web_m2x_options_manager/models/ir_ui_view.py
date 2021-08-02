# Copyright 2021 Camptocamp SA
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

from odoo import models


class IrUiView(models.Model):
    _inherit = "ir.ui.view"

    def postprocess(self, node, current_node_path, editable, name_manager):
        res = super().postprocess(node, current_node_path, editable, name_manager)
        if node.tag == "field":
            mname = name_manager.Model._name
            fname = node.attrib["name"]
            field = self.env[mname]._fields.get(fname)
            if field and field.type in ("many2many", "many2one"):
                rec = self.env["m2x.create.edit.option"].get(mname, field.name)
                if rec:
                    rec._apply_options(node)
        return res

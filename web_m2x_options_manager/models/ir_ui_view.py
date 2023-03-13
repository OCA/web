# Copyright 2021 Camptocamp SA
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

from odoo import models


class IrUiView(models.Model):
    _inherit = "ir.ui.view"

    def _postprocess_tag_field(self, node, name_manager, node_info):
        res = super()._postprocess_tag_field(node, name_manager, node_info)
        if node.tag == "field":
            mname = name_manager.model._name
            field = name_manager.model._fields.get(node.get("name"))
            if field and field.type in ("many2many", "many2one"):
                rec = self.env["m2x.create.edit.option"].get(mname, field.name)
                if rec:
                    rec._apply_options(node)
        return res

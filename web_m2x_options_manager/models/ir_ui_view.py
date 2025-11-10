# Copyright 2021 Camptocamp SA
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

from odoo import models


class IrUiView(models.Model):
    _inherit = "ir.ui.view"

    def _postprocess_tag_field(self, node, name_manager, node_info):
        # OVERRIDE: check ``m2x.create.edit.option`` config when processing a ``field``
        # node in views
        res = super()._postprocess_tag_field(node, name_manager, node_info)
        m2x_option = self.env["m2x.create.edit.option"].get(
            name_manager.model._name,
            # ``name`` is required in ``<field/>`` items
            node.attrib["name"],
        )
        if m2x_option:
            m2x_option._apply_options(node)
        return res

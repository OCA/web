# Copyright 2021 Camptocamp SA
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

from odoo import models


class IrUiView(models.Model):
    _inherit = "ir.ui.view"

    def _postprocess_tag_field(self, node, name_manager, node_info):
        # OVERRIDE: check ``m2x.create.edit.option`` config when processing a ``field``
        # node in views
        res = super()._postprocess_tag_field(node, name_manager, node_info=node_info)
        optget = self.env["m2x.create.edit.option"].get
        model_name = name_manager.model._name
        if (field_name := node.get("name")) and (opt := optget(model_name, field_name)):
            opt._apply_options(node)
        return res

# Copyright 2023 Numigi (tm) and all its contributors (https://bit.ly/numigiens)
# License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl).

from odoo import models

from ..utils import add_custom_modifiers_to_view_arch, set_custom_modifiers_on_fields


class ViewWithCustomModifiers(models.Model):
    _inherit = "ir.ui.view"

    def postprocess(self, node, current_node_path, editable, name_manager):
        """Add custom modifiers to the view xml.

        This method is called in Odoo when generating the final xml of a view.
        """
        model_name = name_manager.Model._name
        modifiers = self.env["web.custom.modifier"].get(model_name)
        node_with_custom_modifiers = add_custom_modifiers_to_view_arch(modifiers, node)
        set_custom_modifiers_on_fields(modifiers, name_manager.available_fields)
        self.clear_caches()  # Clear the cache in order to recompute _get_active_rules
        return super().postprocess(
            node_with_custom_modifiers, current_node_path, editable, name_manager
        )

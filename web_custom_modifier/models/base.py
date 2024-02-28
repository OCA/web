# Copyright 2023 - today Numigi (tm) and all its contributors (https://bit.ly/numigiens)
# License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl).

from odoo import api, models

from ..utils import set_custom_modifiers_on_fields


class Base(models.AbstractModel):

    _inherit = "base"

    @api.model
    def fields_get(self, allfields=None, attributes=None):
        """Add the custom modifiers to the fields metadata."""
        fields = super().fields_get(allfields, attributes)
        modifiers = self.env["web.custom.modifier"].get(self._name)
        set_custom_modifiers_on_fields(modifiers, fields)
        return fields

# Copyright 2024 Hunki Enterprises BV
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl-3.0)

from odoo import api, fields, models


class Base(models.AbstractModel):
    _inherit = "base"

    def _valid_field_parameter(self, field, name):
        return super()._valid_field_parameter(field, name) or (
            name == "pattern" and isinstance(field, fields.Char)
        )

    @api.model
    def _get_view_field_attributes(self):
        return super()._get_view_field_attributes() + ["pattern"]

    @api.model
    def fields_get(self, allfields=None, attributes=None):
        result = super().fields_get(allfields=allfields, attributes=attributes)
        if attributes is None or "pattern" in attributes:
            for field_name, description in result.items():
                field = self._fields.get(field_name)
                pattern = getattr(field, "pattern", None)
                if pattern is not None:
                    description["pattern"] = pattern
        return result

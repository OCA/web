# Copyright 2023 ACSONE SA/NV
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).


from odoo import api, models


class Base(models.AbstractModel):
    _inherit = "base"

    @api.model
    def fields_get(self, allfields=None, attributes=None):
        res = super().fields_get(allfields=allfields, attributes=attributes)
        fnames = res.keys()
        tooltips_data = (
            self.env["ir.model.fields.tooltip"]
            .sudo()
            .search_read(
                [
                    ("model", "=", self._name),
                    ("field_name", "in", list(fnames)),
                ],
                [],
            )
        )
        for tooltip_data in tooltips_data:
            tooltip_fname = tooltip_data["field_name"]
            res[tooltip_fname]["field_tooltip"] = tooltip_data
        return res

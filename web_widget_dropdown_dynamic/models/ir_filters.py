# Copyright 2024 Tecnativa - Carlos Roca
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl.html).

from odoo import api, models


class IrFilters(models.Model):
    _inherit = "ir.filters"

    @api.model
    def dynamic_dropdown_int_method_demo(self):
        values = [
            ("1", "One"),
        ]
        if self.env.context.get("depending_on") == self.env.ref("base.user_admin").id:
            values += [
                ("2", "Two"),
            ]
        return values

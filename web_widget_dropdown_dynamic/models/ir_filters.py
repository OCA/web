# Copyright 2024 Tecnativa - Carlos Roca
# License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl.html).

from odoo import api, models


class IrFilters(models.Model):
    _inherit = "ir.filters"

    @api.model
    def dynamic_dropdown_int_method_demo(self):
        values = [
            ("1", "One"),
        ]
        # depending_on may arrive as a list of ids (Many2many) or as a single
        # id (Many2one); both forms are accepted on purpose.
        depending_on = self.env.context.get("depending_on")
        admin_id = self.env.ref("base.user_admin").id
        if isinstance(depending_on, (list, tuple)):
            matches = admin_id in depending_on
        else:
            matches = depending_on == admin_id
        if matches:
            values += [
                ("2", "Two"),
            ]
        return values

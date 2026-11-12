# Copyright 2026 Domatix
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

from odoo import fields, models

GRID_VIEW = ("grid_view", "Grid")


class IrUIView(models.Model):
    _inherit = "ir.ui.view"

    type = fields.Selection(selection_add=[GRID_VIEW])

    def _is_qweb_based_view(self, view_type):
        return view_type == GRID_VIEW[0] or super()._is_qweb_based_view(view_type)

    def _get_view_info(self):
        return {"grid_view": {"icon": "fa fa-th"}} | super()._get_view_info()

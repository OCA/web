# Copyright 2026 Le Filament (https://le-filament.com)
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

from odoo import fields, models


class IrUiView(models.Model):
    _inherit = "ir.ui.view"

    type = fields.Selection(selection_add=[("resource", "Resource")])

    def _get_view_info(self):
        # Declare the "resource" view type to the web client (icon, etc.).
        # Without this, session.view_info does not contain "resource" and the
        # action service rejects the action ("View types not defined resource").
        return {
            **super()._get_view_info(),
            "resource": {"icon": "fa fa-calendar-check-o"},
        }

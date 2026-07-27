# Copyright 2026 Heligrafics
# License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl).

from odoo import fields, models


class IrActionsActions(models.Model):
    _inherit = "ir.actions.actions"

    main_action = fields.Boolean(
        default=False,
        help="If checked, this action can be considered as a main action"
        " of their module. When some menus are hidden on mobile due to"
        " the desktop_only flag, this action becomes the app entry point.",
    )
    desktop_only = fields.Boolean(
        default=False,
        help="If checked, the menu entry associated to this action will"
        " only be visible on desktop devices (hidden on mobile).",
    )

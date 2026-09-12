# Copyright 2026 volkantasci
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

from odoo import fields, models


class ResUsers(models.Model):
    _inherit = "res.users"

    apps_menu_theme = fields.Selection(
        selection_add=[("focus", "Focus")],
        ondelete={"focus": "cascade"},
    )

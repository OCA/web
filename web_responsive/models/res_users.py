# Copyright 2023 Taras Shabaranskyi
# License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl.html).

from odoo import fields, models


class ResUsers(models.Model):
    _inherit = "res.users"

    apps_menu_search_type = fields.Selection(
        [
            ("canonical", "Canonical"),
            ("fuse", "Fuse"),
            ("command_palette", "Command Palette"),
        ],
        default="canonical",
        required=True,
    )
    apps_menu_theme = fields.Selection(
        [
            ("milk", "Milk"),
            ("community", "Community"),
        ],
        default="milk",
        required=True,
    )

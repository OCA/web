# Copyright 2026 volkantasci
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

from odoo import fields, models


class ResUsers(models.Model):
    _inherit = "res.users"

    apps_menu_theme = fields.Selection(
        selection_add=[("focus", "Focus")],
        ondelete={"focus": "cascade"},
    )

    # Odoo 19: non-admin users may only write whitelisted fields on their own
    # record. web_responsive's preference fields (apps_menu_theme,
    # apps_menu_search_type, is_redirect_home) are NOT registered there →
    # normal users get an AccessError when changing the theme in Preferences
    # (the dialog freezes / clicks blocked). Registered here — in our local
    # module, so the fix survives OCA repo refreshes (web_responsive itself
    # lacks this override in 19.0.1.1.0).
    @property
    def SELF_READABLE_FIELDS(self):
        return super().SELF_READABLE_FIELDS + [
            "apps_menu_theme",
            "apps_menu_search_type",
            "is_redirect_home",
        ]

    @property
    def SELF_WRITEABLE_FIELDS(self):
        return super().SELF_WRITEABLE_FIELDS + [
            "apps_menu_theme",
            "apps_menu_search_type",
            "is_redirect_home",
        ]

# License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl).

from odoo import models


class ResUsers(models.Model):
    _inherit = "res.users"

    def action_reset_apps_menu_grid(self):
        # Clear the per-user app grid layout; the client reloads so the
        # grid rebuilds in the default order.
        settings = self.env["res.users.settings"]._find_or_create_for_user(
            self.env.user
        )
        settings.apps_menu_grid_layout = False
        return {"type": "ir.actions.client", "tag": "reload_context"}

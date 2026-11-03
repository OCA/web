# License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl).

from odoo import fields, models


class ResUsersSettings(models.Model):
    _inherit = "res.users.settings"

    apps_menu_grid_layout = fields.Json()

# License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl.html).

from odoo import fields, models


class ResUsersSettings(models.Model):
    _inherit = "res.users.settings"

    apps_menu_order = fields.Json(
        help="Ordered root menu ids for the Apps Menu, as arranged by the user",
        default=list,
    )

# © 2026 Liam Noonan - Pyxiris
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

from odoo import fields, models


class ResUsersSettings(models.Model):
    _inherit = "res.users.settings"

    # These fields should be here in order to be accessible via in js
    # as user.settings.persistent_classic_theme
    persistent_classic_theme = fields.Boolean(default=True)

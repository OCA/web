# © 2022 Florian Kantelberg - initOS GmbH
# © 2026 Liam Noonan - Pyxiris
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

from odoo import fields, models


class ResUsersSettings(models.Model):
    _inherit = "res.users.settings"

    # These fields should be here in order to be accessible via in js
    # as user.settings.dark_mode, etc.
    dark_mode = fields.Boolean()
    dark_mode_device_dependent = fields.Boolean()

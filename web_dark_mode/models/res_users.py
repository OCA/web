# © 2022 Florian Kantelberg - initOS GmbH
# © 2026 Liam Noonan - Pyxiris
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).


from odoo import fields, models


class ResUsers(models.Model):
    _inherit = "res.users"

    dark_mode = fields.Boolean(
        related="res_users_settings_id.dark_mode", readonly=False
    )
    dark_mode_device_dependent = fields.Boolean(
        related="res_users_settings_id.dark_mode_device_dependent",
        readonly=False,
        string="Device Dependent Dark Mode",
    )

    @property
    def SELF_READABLE_FIELDS(self):
        return super().SELF_READABLE_FIELDS + [
            "dark_mode_device_dependent",
            "dark_mode",
        ]

    @property
    def SELF_WRITEABLE_FIELDS(self):
        return super().SELF_WRITEABLE_FIELDS + [
            "dark_mode_device_dependent",
            "dark_mode",
        ]

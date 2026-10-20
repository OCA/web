# © 2022 Florian Kantelberg - initOS GmbH
# © 2025 Liam Noonan - Pyxiris
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

from odoo import fields, models


class ResUsers(models.Model):
    _inherit = "res.users"

    persistent_classic_theme = fields.Boolean(
        related="res_users_settings_id.persistent_classic_theme",
        readonly=False,
        string="Classic Theme Persistent",
        help="This enables Classic Theme on this user's account across all devices. \n "
        "Disabling it will will alow you to to use the toggle in the user burger menu "
        "in the navbar to enable Classic Mode on a specific session/device \n"
        "The toggle is not visible while Persistent Classic Theme is enabled",
    )

    @property
    def SELF_READABLE_FIELDS(self):
        return super().SELF_READABLE_FIELDS + [
            "persistent_classic_theme",
        ]

    @property
    def SELF_WRITEABLE_FIELDS(self):
        return super().SELF_WRITEABLE_FIELDS + [
            "persistent_classic_theme",
        ]

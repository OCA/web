# © 2022 Florian Kantelberg - initOS GmbH
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).


from odoo import fields, models


class ResUsers(models.Model):
    _inherit = "res.users"

    dark_mode = fields.Boolean()
    dark_mode_device_dependent = fields.Boolean("Device Dependent Dark Mode")

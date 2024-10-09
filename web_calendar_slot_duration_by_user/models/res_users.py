# Copyright 2024 Nomadi Plus Tecnologia LTDA - Italo LOPES
# License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl).

from odoo import fields, models


class ResUsers(models.Model):
    _inherit = "res.users"

    slot_duration = fields.Float(
        help="Duration of the default duration for the calendar view in the format HH:MM:SS",
        default="1",
    )

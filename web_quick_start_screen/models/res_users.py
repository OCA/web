# Copyright 2024 Tecnativa - David Vidal
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl.html).
from odoo import fields, models


class ResUsers(models.Model):
    _inherit = "res.users"

    quick_start_screen_id = fields.Many2one(comodel_name="quick.start.screen")

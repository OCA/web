# Copyright 2023 Tecnativa - David Vidal
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).
from odoo import fields, models


class ResUsers(models.Model):
    _inherit = "res.users"

    remote_measure_device_id = fields.Many2one(
        comodel_name="remote.measure.device",
        help="Default remote measure device for this user",
    )

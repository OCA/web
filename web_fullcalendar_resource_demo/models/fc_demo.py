# Copyright 2026 Le Filament (https://le-filament.com)
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

from odoo import fields, models


class FcDemoResource(models.Model):
    _name = "fc.demo.resource"
    _description = "Demonstration resource (room, vehicle, ...)"

    name = fields.Char(required=True)
    resource_type = fields.Selection(
        [
            ("room", "Room"),
            ("car", "Vehicle"),
            ("video", "Video call"),
            ("other", "Other"),
        ],
        string="Type",
        default="room",
    )
    active = fields.Boolean(default=True)


class FcDemoBooking(models.Model):
    _name = "fc.demo.booking"
    _description = "Demonstration booking"
    _order = "date_start"

    name = fields.Char(required=True)
    resource_id = fields.Many2one("fc.demo.resource", string="Resource", required=True)
    user_id = fields.Many2one(
        "res.users", string="Responsible", default=lambda self: self.env.user
    )
    date_start = fields.Datetime(string="Start", required=True)
    date_stop = fields.Datetime(string="Stop", required=True)
    description = fields.Text()

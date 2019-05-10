# Copyright 2019 ACSONE SA/NV
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

from odoo import models, fields


class CalendarEvent(models.Model):

    _inherit = "calendar.event"

    color_id = fields.Many2one(
        'calendar.event.color', string="Meeting type (color)"
    )
    color = fields.Char(string=" ", related="color_id.color")

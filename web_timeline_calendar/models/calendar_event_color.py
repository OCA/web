# Copyright 2019 ACSONE SA/NV
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

from odoo import models, fields


class CalendarEventColor(models.Model):
    _name = "calendar.event.color"
    _description = "Calendar Event Color"

    name = fields.Char('Meeting Type', required=True, translate=True)
    color = fields.Char('Color', required=True)

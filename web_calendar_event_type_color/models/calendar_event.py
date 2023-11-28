# Copyright 2023 Camptocamp SA
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from odoo import fields, models


class CalendarEvent(models.Model):
    _inherit = "calendar.event"

    color = fields.Integer(compute="_compute_color")

    def _compute_color(self):
        for event in self:
            event.color = fields.first(event.categ_ids).color

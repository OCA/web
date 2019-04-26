# Copyright 2019 ACSONE SA/NV
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

from odoo import models, fields, api


class CalendarEvent(models.Model):

    _inherit = "calendar.event"

    user_ids = fields.Many2many(comodel_name='res.users',
                                relation='calendar_event_res_users_rel',
                                column1='calendar_event_id',
                                column2='res_users_id',
                                compute='_compute_user_ids',
                                string="Users",
                                store=True)

    @api.multi
    @api.depends('attendee_ids')
    def _compute_user_ids(self):
        for event in self:
            event.user_ids = event.attendee_ids.\
                mapped('partner_id').mapped('user_ids')

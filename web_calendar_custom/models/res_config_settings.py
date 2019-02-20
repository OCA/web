# Copyright 2018 Savoir-faire Linux
# License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl).

from odoo import api, fields, models, _


class ResConfigSettings(models.TransientModel):
    _inherit = 'res.config.settings'

    calendar_start_time = fields.Float('Calendar Start Time')
    calendar_end_time = fields.Float('Calendar End Time')
    calendar_start_work_time = fields.Float('Calendar Start Working Time')
    calendar_first_day_of_week = fields.Selection([('0', 'Sunday'),
                                                   ('1', 'Monday'),
                                                   ('2', 'Tuesday')],
                                                  default='1')
    calendar_row_duration = fields.Selection([('0.25', '00:15'),
                                                   ('0.5', '00:30'),
                                                   ('1.0', '01:00')],
                                                  default='0.25')
    is_weekend_active = fields.Boolean('Calendar Weekends',
                                                default=True)
    is_event_overlap = fields.Boolean('Calendar Overlap Events',
                                            default=False)

    _sql_constraints = [
        ('check_calendar_start_and_end_time',
         "CHECK ((calendar_start_time < calendar_end_time) AND"
         "(calendar_start_time >= 0) AND ( calendar_start_time < 24) AND"
         "(calendar_end_time >= 0) AND ( calendar_end_time < 24)) ",
         _('Start time must be before end time')),
        ('check_calendar_start_work_time',
         "CHECK ((calendar_start_time < calendar_start_work_time) AND"
         "(calendar_start_work_time < calendar_end_time) AND"
         "( calendar_start_time < 24) AND (calendar_end_time >= 0))",
         _('Start work time must be set between start and end time')),
        ('check_calendar_row_duration',
         "CHECK ((calendar_row_duration >= 0.25)"
         "AND(calendar_row_duration <= 1))",
         _('Row Duration must be between 15 minutes and 1 hour')),
    ]

    @api.model
    def get_values(self):
        res = super(ResConfigSettings, self).get_values()
        res.update(
            calendar_start_time=self.env[
                'ir.config_parameter'].sudo().get_param(
                'web_calendar_custom.calendar_start_time'),
            calendar_end_time=self.env[
                'ir.config_parameter'].sudo().get_param(
                'web_calendar_custom.calendar_end_time'),
            calendar_start_work_time=self.env[
                'ir.config_parameter'].sudo().get_param(
                'web_calendar_custom.calendar_start_work_time'),
            calendar_first_day_of_week=self.env[
                'ir.config_parameter'].sudo().get_param(
                'web_calendar_custom.calendar_first_day_of_week'),
            is_weekend_active=self.env[
                'ir.config_parameter'].sudo().get_param(
                'web_calendar_custom.is_weekend_active'),
            is_event_overlap=self.env[
                'ir.config_parameter'].sudo().get_param(
                'web_calendar_custom.is_event_overlap'),
            calendar_row_duration=self.env[
                'ir.config_parameter'].sudo().get_param(
                'web_calendar_custom.calendar_row_duration'),
        )
        return res

    @api.multi
    def set_values(self):
        super(ResConfigSettings, self).set_values()
        self.env['ir.config_parameter'].sudo().set_param(
            'web_calendar_custom.calendar_start_time',
            self.calendar_start_time)
        self.env['ir.config_parameter'].sudo().set_param(
            'web_calendar_custom.calendar_end_time',
            self.calendar_end_time)
        self.env['ir.config_parameter'].sudo().set_param(
            'web_calendar_custom.calendar_start_work_time',
            self.calendar_start_work_time)
        self.env['ir.config_parameter'].sudo().set_param(
            'web_calendar_custom.calendar_first_day_of_week',
            self.calendar_first_day_of_week)
        self.env['ir.config_parameter'].sudo().set_param(
            'web_calendar_custom.is_weekend_active',
            self.is_weekend_active)
        self.env['ir.config_parameter'].sudo().set_param(
            'web_calendar_custom.is_event_overlap',
            self.is_event_overlap)
        self.env['ir.config_parameter'].sudo().set_param(
            'web_calendar_custom.calendar_row_duration',
            self.calendar_row_duration)

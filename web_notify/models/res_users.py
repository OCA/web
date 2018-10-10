# Copyright 2016 ACSONE SA/NV
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

from odoo import api, exceptions, fields, models, _


class ResUsers(models.Model):
    _inherit = 'res.users'

    @api.depends('create_date')
    def _compute_channel_names(self):
        for record in self:
            res_id = record.id
            record.notify_info_channel_name = 'notify_info_%s' % res_id
            record.notify_warning_channel_name = 'notify_warning_%s' % res_id

    notify_info_channel_name = fields.Char(
        compute='_compute_channel_names')
    notify_warning_channel_name = fields.Char(
        compute='_compute_channel_names')

    def notify_info(self, message="Default message", title=None, sticky=False):
        title = title or _('Information')
        self._notify_channel(
            'notify_info_channel_name', message, title, sticky)

    def notify_warning(self, message="Default message",
                       title=None, sticky=False):
        title = title or _('Warning')
        self._notify_channel(
            'notify_warning_channel_name', message, title, sticky)

    def _notify_channel(self, channel_name_field, message, title, sticky):
        if (not self.env.user._is_admin()
                and any(user.id != self.env.uid for user in self)):
            raise exceptions.UserError(
                _('Sending a notification to another user is forbidden.')
            )
        bus_message = {
            'message': message,
            'title': title,
            'sticky': sticky
        }
        notifications = [(record[channel_name_field], bus_message)
                         for record in self]
        self.env['bus.bus'].sendmany(notifications)

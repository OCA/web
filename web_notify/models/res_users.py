# -*- coding: utf-8 -*-
# Copyright 2016 ACSONE SA/NV
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

from openerp import api, models, _


class ResUsers(models.Model):

    _inherit = 'res.users'

    @api.multi
    def notify_info(self, message, title=None, sticky=False):
        title = title or _('Information')
        self._notify_channel('notify_info', message, title, sticky)

    @api.multi
    def notify_warning(self, message, title=None, sticky=False):
        title = title or _('Warning')
        self._notify_channel('notify_warning', message, title, sticky)

    @api.multi
    def _notify_channel(self, channel_name_prefix, message, title, sticky):
        notification = {
            'message': message,
            'title': title,
            'sticky': sticky
        }
        bus_bus = self.env['bus.bus']
        for record in self:
            channel_name = channel_name_prefix + "_%s" % record.id
            bus_bus.sendone(channel_name, notification)

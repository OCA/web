# -*- coding: utf-8 -*-
# Copyright 2016 ACSONE SA/NV
# Copyright 2018 Camptocamp
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

from odoo import api, exceptions, fields, models, _, SUPERUSER_ID
from odoo.addons.web.controllers.main import clean_action


class ResUsers(models.Model):

    _inherit = 'res.users'

    @api.multi
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

    @api.multi
    def notify_info(self, message, title=None, sticky=False,
                    show_reload=False, action=None,
                    action_link_name=None, **options):
        title = title or _('Information')
        self._notify_channel(
            'notify_info_channel_name', message, title,
            sticky=sticky, show_reload=show_reload, action=action,
            action_link_name=action_link_name, **options
        )

    @api.multi
    def notify_warning(self, message, title=None, sticky=False,
                       show_reload=False, action=None,
                       action_link_name=None, **options):
        title = title or _('Warning')
        self._notify_channel(
            'notify_warning_channel_name', message, title,
            sticky=sticky, show_reload=show_reload, action=action,
            action_link_name=action_link_name, **options
        )

    @api.multi
    def _notify_channel(self, channel_name_field, message, title, **options):
        if (self.env.uid != SUPERUSER_ID
                and any(user.id != self.env.uid for user in self)):
            raise exceptions.UserError(
                _('Sending a notification to another user is forbidden.')
            )
        if options.get('action'):
            options['action'] = clean_action(options['action'])
        bus_message = {
            'message': message,
            'title': title,
        }
        bus_message.update(options)
        notifications = [(getattr(record, channel_name_field), bus_message)
                         for record in self]
        self.env['bus.bus'].sendmany(notifications)

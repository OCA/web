# -*- coding: utf-8 -*-
##############################################################################
#
#    OpenERP, Open Source Management Solution
#    Copyright (C) 2004-today OpenERP SA (<http://www.openerp.com>)
#
#    This program is free software: you can redistribute it and/or modify
#    it under the terms of the GNU Affero General Public License as
#    published by the Free Software Foundation, either version 3 of the
#    License, or (at your option) any later version.
#
#    This program is distributed in the hope that it will be useful,
#    but WITHOUT ANY WARRANTY; without even the implied warranty of
#    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
#    GNU Affero General Public License for more details.
#
#    You should have received a copy of the GNU Affero General Public License
#    along with this program.  If not, see <http://www.gnu.org/licenses/>.
#
##############################################################################


import openerp
from openerp.models import BaseModel
from openerp import models, api


class MailNotification(models.Model):
    _inherit = 'mail.notification'

    @api.model
    def create(self, vals):
        res = super(MailNotification, self).create(vals)
        bus = self.env['bus.bus']
        user_obj = self.env['res.users']
        users = user_obj.search([('partner_id', '=', res.partner_id.id)])
        for user in users:
            bus.sendone(self._name, user.id)
        return res


create_original = BaseModel.create


@openerp.api.model
@openerp.api.returns('self', lambda value: value.id)
def create(self, vals):
    record_id = create_original(self, vals)
    auto_refresh_kanban_list(self)
    return record_id
BaseModel.create = create


write_original = BaseModel.write


@openerp.api.multi
def write(self, vals):
    result = write_original(self, vals)
    auto_refresh_kanban_list(self)
    return result
BaseModel.write = write


unlink_original = BaseModel.unlink


@openerp.api.multi
def unlink(self):
    result = unlink_original(self)
    auto_refresh_kanban_list(self)
    return result
BaseModel.unlink = unlink


def auto_refresh_kanban_list(model):
    if model._name != 'bus.bus':
        module = model._name.split('.')[0]
        if module not in ['ir', 'res', 'base', 'bus', 'im_chat', 'mail', 'email', 
            'temp', 'workflow', 'wizard', 'email_template', 'mass']:
            action = model.env['ir.actions.act_window']
            cnt = action.search_count([('res_model', '=', model._name), ('auto_refresh', '>', '0')])
            if cnt > 0:
                bus = model.env['bus.bus']
                bus.sendone('auto_refresh_kanban_list', model._name)

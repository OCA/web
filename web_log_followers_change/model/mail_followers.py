# -*- coding: utf-8 -*-
##############################################################################
#
#    OpenERP, Open Source Management Solution
#    Copyright (C) 2010-2013 OpenERP s.a. (<http://openerp.com>).
#    Copyright (C) 2013 ThinkOpen Solutions Brasil (<http://www.tkobr.com>).
#    Author Carlos Almeida <carlos.almeida at tkobr.com>
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

from openerp.addons.mail.mail_thread import mail_thread
from openerp.osv import osv
from openerp.tools.translate import _


message_subscribe_super = mail_thread.message_subscribe
message_unsubscribe_super = mail_thread.message_unsubscribe


def LogChangeMessageSubscribe(self, cr, uid, ids, partner_ids,
                              subtype_ids=None, context=None):

    thread_id = message_subscribe_super(self, cr, uid, ids, partner_ids,
                                        subtype_ids=subtype_ids,
                                        context=context)
    if thread_id:
        for id in ids:
            followers = self.pool.get('res.partner').browse(cr, uid,
                                                            partner_ids,
                                                            context=context)
            for follower in followers:
                msg = _('Follower %s added') % follower.name
                self.message_post(cr, uid, [id], body=msg, context=context)
    return thread_id


def LogChangeMessageUnsubscribe(self, cr, uid, ids, partner_ids, context=None):

    res = message_unsubscribe_super(self, cr, uid, ids, partner_ids,
                                    context=context)
    for id in ids:
        followers = self.pool.get('res.partner').browse(cr, uid, partner_ids,
                                                        context=context)
        for follower in followers:
            msg = _('Follower %s removed') % follower.name
            self.message_post(cr, uid, [id], body=msg, context=context)
    return res


class LogChangeMessageFollowers(osv.Model):
    ''' I define this class so this code will be executed only if module
        is installed in database. Otherwise it will be always executed.
    '''
    _name = 'mail.thread'

    def __init__(self, *arg, **kwargs):
        mail_thread.message_subscribe = LogChangeMessageSubscribe
        mail_thread.message_unsubscribe = LogChangeMessageUnsubscribe

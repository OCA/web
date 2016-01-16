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
from openerp import models, api


message_post_super = mail_thread.message_post


@api.cr_uid_ids_context
def MailNoFollowersMessageFetch(self, cr, uid, thread_id, body='',
                                subject=None, type='notification',
                                subtype=None, parent_id=False,
                                attachments=None, context=None,
                                content_subtype='html', **kwargs):

    nosub_ctx = dict(context, mail_create_nosubscribe=True,
                     mail_create_nolog=True)

    thread_id = message_post_super(self, cr, uid, thread_id, body=body,
                                   subject=subject, type=type,
                                   subtype=subtype, parent_id=parent_id,
                                   attachments=attachments, context=nosub_ctx,
                                   content_subtype=content_subtype, **kwargs)
    return thread_id


class MailNoFollowers(models.Model):
    ''' I define this class so this code will be executed only if module
        is installed in database. Otherwise it will be always executed.
        This way we switch to standard method without a server restart.
    '''
    _name = 'mail.thread'

    def __init__(self, *arg, **kwargs):
        mail_thread.message_post = MailNoFollowersMessageFetch

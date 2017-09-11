# -*- coding: utf-8 -*-
# Copyright 2004-2010 OpenERP SA (<http://www.openerp.com>)
# Copyright 2011-2015 Serpent Consulting Services Pvt. Ltd.
# Copyright 2017 Tecnativa - Vicent Cubells
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

import base64
from odoo import _, models, fields


class MailThread(models.AbstractModel):
    _inherit = "mail.thread"

    def _track_signature(self, values, field):
        """ This method allows to track creation and deletion of signature
            field. You must call this method in order to display a message
            in the chatter with information of the changes in the signature.

            :param values: a dict with the values being written
            :param field: name of the field that must be tracked
        """
        if field in values:
            attachments = []
            messages = []
            if values.get(field):
                content = base64.b64decode(values.get(field))
                attachments = [('signature', content)]
                messages.append(_('Signature has been created.'))
                messages.append(
                    _('Signature date: %s' % fields.Datetime.now()))
            else:
                messages.append(_('Signature has been deleted.'))
                messages.append(_('Deletion date: %s' % fields.Datetime.now()))
            msg_body = '<ul>'
            for message in messages:
                msg_body += '<li>'
                msg_body += message
                msg_body += '</li>'
            msg_body += '</ul>'
            self.message_post(body=msg_body, attachments=attachments)

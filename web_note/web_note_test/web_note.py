# -*- coding: utf-8 -*-
# © initOS GmbH 2014
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).
from openerp.osv import orm, fields


class web_notes(orm.Model):
    _inherit = 'web.note'
    _columns = {
        'partner_id':
            fields.many2one('res.partner', 'Partner Id', invisible=True),
    }

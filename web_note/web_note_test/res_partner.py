# -*- coding: utf-8 -*-
# © initOS GmbH 2014
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).
from openerp.osv import orm, fields


class res_partner(orm.Model):
    _inherit = 'res.partner'

    _columns = {
        'notes': fields.one2many('web.note', 'partner_id', 'Notes')
    }

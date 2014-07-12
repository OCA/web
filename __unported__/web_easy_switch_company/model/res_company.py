# -*- encoding: utf-8 -*-
##############################################################################
#
#    Web Easy Switch Company module for OpenERP
#    Copyright (C) 2014 GRAP (http://www.grap.coop)
#    @author Sylvain LE GAL (https://twitter.com/legalsylvain)
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

from openerp.osv import fields
from openerp.osv.orm import Model
from openerp.tools import image_resize_image


class res_company(Model):
    _inherit = 'res.company'

    # Custom Section
    def _switch_company_get_companies_from_partner(
            self, cr, uid, ids, context=None):
        return self.pool['res.company'].search(
            cr, uid, [('partner_id', 'in', ids)], context=context)

    # Fields function Section
    def _get_logo_topbar(self, cr, uid, ids, _field_name, _args, context=None):
        result = dict.fromkeys(ids, False)
        for record in self.browse(cr, uid, ids, context=context):
            size = (48, 48)
            result[record.id] = image_resize_image(
                record.partner_id.image, size)
        return result

    # Columns Section
    _columns = {
        'logo_topbar': fields.function(
            _get_logo_topbar,
            string="Logo displayed in the switch company menu",
            type="binary", store={
                'res.company': (lambda s, c, u, i, x: i, ['partner_id'], 10),
                'res.partner': (_switch_company_get_companies_from_partner,
                                ['image'], 10),
            }
        ),
    }

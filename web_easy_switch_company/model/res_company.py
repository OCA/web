## -*- encoding: utf-8 -*-
#################################################################################
##    See __openerp__.py file for Copyright and Licence Informations.
#################################################################################

from openerp.osv.orm import Model
from openerp.osv import fields
from openerp.tools import image_resize_image

class res_company(Model):
    _inherit = 'res.company'

    ### Custom Section
    def _switch_company_get_companies_from_partner(self, cr, uid, ids, context=None):
        return self.pool['res.company'].search(cr, uid, [('partner_id', 'in', ids)], context=context)

    ### Fields function Section
    def _get_logo_topbar(self, cr, uid, ids, _field_name, _args, context=None):
        result = dict.fromkeys(ids, False)
        for record in self.browse(cr, uid, ids, context=context):
            size = (48, 48)
            result[record.id] = image_resize_image(record.partner_id.image, size)
        return result

    ### Columns Section
    _columns = {
        'logo_topbar': fields.function(_get_logo_topbar, string="Logo displayed in the switch company menu", 
            type="binary", store={
            'res.company': (lambda s, c, u, i, x: i, ['partner_id'], 10),
            'res.partner': (_switch_company_get_companies_from_partner, ['image'], 10),
        }),
    }

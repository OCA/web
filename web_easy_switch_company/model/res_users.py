# -*- encoding: utf-8 -*-
################################################################################
#    See __openerp__.py file for Copyright and Licence Informations.
################################################################################

from openerp.osv.orm import Model

class res_users(Model):
    _inherit = 'res.users'

    ### Custom Function Section
    def change_current_company(self, cr, uid, company_id, context=None):
        return self.write(cr, uid, uid, {'company_id': company_id})

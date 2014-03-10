# -*- encoding: utf-8 -*-
################################################################################
#    See __openerp__.py file for Copyright and Licence Informations.
################################################################################

import openerp

class WebEasySwitchCompanyController(openerp.addons.web.http.Controller):
    _cp_path = '/web_easy_switch_company/switch'

    @openerp.addons.web.http.jsonrequest
    def change_current_company(self, req, company_id):
        req.session.model('res.users').change_current_company(company_id)

# coding: utf-8
# Copyright (C) 2014 - Today: GRAP (http://www.grap.coop)
# @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

import openerp
import openerp.http as http
from openerp.http import request


class WebEasySwitchCompanyController(http.Controller):
    @http.route(
        '/web_easy_switch_company/switch/change_current_company',
        type='json', auth='none')
    def change_current_company(self, company_id):
        registry = openerp.modules.registry.RegistryManager.get(
            request.session.db)
        uid = request.session.uid
        with registry.cursor() as cr:
            res = registry.get("res.users").change_current_company(
                cr, uid, company_id)
            return res

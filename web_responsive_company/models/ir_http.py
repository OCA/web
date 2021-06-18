# Copyright (C) 2021-Today: GRAP (http://www.grap.coop)
# @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from odoo import models
from odoo.http import request


class IrHttp(models.AbstractModel):
    _inherit = 'ir.http'

    def session_info(self):
        res = super().session_info()
        user = request.env.user
        companies = []
        for company in user.company_ids:
            # Lazy dependency to res_company_code module
            # if installed, return code and complete name
            # to allow to display code separately, and
            # search by code and name. (complete_name)
            companies.append({
                'id': company.id,
                'code': 'code' in company._fields and company.code or '',
                'name': company.name,
                'complete_name': 'complete_name' in company._fields
                and company.complete_name or company.name,
                })
        res["complete_companies"] = companies
        return res

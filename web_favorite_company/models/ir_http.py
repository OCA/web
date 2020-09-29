# Copyright (C) 2020-Today: GRAP (http://www.grap.coop)
# @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from odoo import models
from odoo.http import request


class IrHttp(models.AbstractModel):
    _inherit = 'ir.http'

    def session_info(self):
        res = super().session_info()
        user = request.env.user
        favorite_company_ids = user.favorite_company_ids.ids
        companies = []
        for company in user.company_ids:
            companies.append({
                'id': company.id,
                'name': company.name,
                'code': 'code' in company._fields and company.code or '',
                'is_favorite': company.id in favorite_company_ids,
                })
        companies = sorted(
            companies, key=lambda x: x['is_favorite'], reverse=True)
        res["ordered_companies"] = companies
        return res

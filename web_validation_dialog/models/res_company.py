# -*- coding: utf-8 -*-
# See LICENSE file for full copyright and licensing details.
from odoo import api, fields, models


class ResCompany(models.Model):
    _inherit = 'res.company'

    security_key = fields.Char('Security Code')

    @api.model
    def check_security(self, vals):
        fields = vals.get('field').encode('ascii', 'ignore')
        company_id = vals.get('companyId')
        return company_id and\
            self.browse(company_id)[fields] == vals.get('password') or False

# coding: utf-8
# Copyright (C) 2014 - Today: GRAP (http://www.grap.coop)
# @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from openerp import api, models


class ResUsers(models.Model):
    _inherit = 'res.users'

    @api.model
    def change_current_company(self, company_id):
        return self.env.user.write({'company_id': company_id})

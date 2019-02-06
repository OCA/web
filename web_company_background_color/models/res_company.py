# Copyright 2017 ACSONE SA/NV
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

from odoo import api, fields, models


class ResCompany(models.Model):

    _inherit = 'res.company'

    background_color = fields.Char()

    @api.model
    def get_background_color(self):
        return self.env.user.company_id.background_color

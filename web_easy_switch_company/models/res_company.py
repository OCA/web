# coding: utf-8
# Copyright (C) 2014 - Today: GRAP (http://www.grap.coop)
# @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from openerp import api, fields, models
from openerp.tools import image_resize_image


class ResCompany(models.Model):
    _inherit = 'res.company'

    # Columns Section
    logo_topbar = fields.Binary(
        compute='_compute_logo_topbar', store=True,
        string="Logo displayed in the switch company menu")

    # Compute Section
    @api.multi
    @api.depends('partner_id.image')
    def _compute_logo_topbar(self):
        for company in self:
            size = (48, 48)
            company.logo_topbar = image_resize_image(
                company.partner_id.image, size)

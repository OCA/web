# -*- coding: utf-8 -*-
# © 2015 Therp BV <http://therp.nl>
# © 2016 Pedro M. Baeza
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

from openerp import models, fields


class ResCompany(models.Model):
    _inherit = 'res.company'

    favicon_backend = fields.Binary()
    favicon_backend_mimetype = fields.Selection(
        selection=[('image/x-icon', 'image/x-icon'),
                   ('image/gif', 'image/gif'),
                   ('image/png', 'image/png')],
        help='Set the mimetype of your file.')

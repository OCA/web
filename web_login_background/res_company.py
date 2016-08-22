# -*- coding: utf-8 -*-
# © initOS GmbH 2016
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).
from openerp.osv import orm, fields


class ResCompany(orm.Model):
    _inherit = 'res.company'

    _columns = {
        'login_background_img': fields.binary(
            string='Login Background Image',
            help="This field holds the image used for background "),
        'display_login_logo': fields.boolean('Display Login Logo'),
    }

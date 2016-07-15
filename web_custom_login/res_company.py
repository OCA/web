# -*- coding: utf-8 -*-
##############################################################################
#
#    OpenERP, Open Source Management Solution
#    Copyright (C) 2013 initOS GmbH & Co. KG (<http://www.initos.com>).
#    Author Thomas Rehn <thomas.rehn at initos.com>
#
#    This program is free software: you can redistribute it and/or modify
#    it under the terms of the GNU Affero General Public License as
#    published by the Free Software Foundation, either version 3 of the
#    License, or (at your option) any later version.
#
#    This program is distributed in the hope that it will be useful,
#    but WITHOUT ANY WARRANTY; without even the implied warranty of
#    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
#    GNU Affero General Public License for more details.
#
#    You should have received a copy of the GNU Affero General Public License
#    along with this program.  If not, see <http://www.gnu.org/licenses/>.
#
##############################################################################

from openerp.osv import fields, osv
from openerp.tools import image_resize_image


class ResCompany(osv.Model):
    _inherit = 'res.company'

    def _get_login_logo_web(
            self, cr, uid, ids, _field_name, _args, context=None):
        result = dict.fromkeys(ids, False)
        for record in self.browse(cr, uid, ids, context=context):
            size = (180, None)
            image = record.login_image if record.has_login_image \
                else record.partner_id.image
            result[record.id] = image_resize_image(image, size)
        return result

    def _has_login_image(self, cr, uid, ids, name, args, context=None):
        result = {}
        for obj in self.browse(cr, uid, ids, context=context):
            result[obj.id] = obj.login_image is not False
        return result

    _columns = {
        'style_css': fields.text('Custom Cascading Style Sheet (CSS)'),

        'login_logo_web': fields.function(
            _get_login_logo_web,
            string='Login Logo Web',
            type='binary',
            store=True,
        ),
        'login_image': fields.binary(
            string='Login Image',
            help="This field holds the image used on the login screen, "
                 "limited to 1024x1024px.",
        ),
        'has_login_image': fields.function(
            _has_login_image,
            type="boolean",
            string='Has Login Image?',
        ),
    }

    _defaults = {
        'style_css': """/* copied from web/static/src/css/base.css */
.openerp .oe_login .oe_login_bottom {
background-image: linear-gradient(to bottom, #b41616, #600606);
}
.openerp .oe_login button {
background-color:#138c13;
background-image: linear-gradient(to bottom, #b92020, #600606);
}"""
    }

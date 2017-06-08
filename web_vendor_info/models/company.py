# -*- encoding: utf-8 -*-
##############################################################################
#
#    Web Vendor Info module for OpenERP
#    Copyright (C) 2015 ABF OSIELL SARL (http://osiell.com)
#                       Sebastien Alix (https://twitter.com/seb_alix)
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

from openerp.osv import osv, fields


class res_company(osv.Model):
    _inherit = 'res.company'

    def _vendor_name(self, cr, uid, ids, name, arg, context=None):
        """fields.function 'vendor_name'."""
        if context is None:
            context = {}
        res = {}
        config_model = self.pool.get('ir.config_parameter')
        vendor_name = config_model.get_param(
            cr, uid, 'web_vendor_name', context=context)
        for company_id in ids:
            res[company_id] = vendor_name
        return res

    def _vendor_name_inv(self, cr, uid, id_, name, value, arg, context=None):
        if context is None:
            context = {}
        config_model = self.pool.get('ir.config_parameter')
        config_model.set_param(
            cr, uid, 'web_vendor_name', value, context=context)

    def _vendor_release(self, cr, uid, ids, name, arg, context=None):
        """fields.function 'vendor_release'."""
        if context is None:
            context = {}
        res = {}
        config_model = self.pool.get('ir.config_parameter')
        vendor_release = config_model.get_param(
            cr, uid, 'web_vendor_release', context=context)
        for company_id in ids:
            res[company_id] = vendor_release
        return res

    def _vendor_release_inv(
            self, cr, uid, id_, name, value, arg, context=None):
        if context is None:
            context = {}
        config_model = self.pool.get('ir.config_parameter')
        config_model.set_param(
            cr, uid, 'web_vendor_release', value, context=context)

    _columns = {
        'vendor_name': fields.function(
            _vendor_name, fnct_inv=_vendor_name_inv,
            type='char',
            string=u"Vendor name"),
        'vendor_release': fields.function(
            _vendor_release, fnct_inv=_vendor_release_inv,
            type='char',
            string=u"Vendor release"),
    }

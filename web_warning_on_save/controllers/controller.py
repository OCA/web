# -*- coding: utf-8 -*-
##############################################################################
#
#    Author: Damien Crier
#    Copyright 2015 Camptocamp SA
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

import xmlrpclib
import openerp


class WarningOnSaveController(openerp.addons.web.http.Controller):
    _cp_path = "/web_warning_on_save"

    @openerp.addons.web.http.jsonrequest
    def check_warning_on_save(self, req, model, id):
        """
         try to call a method on the model given in parameter
         if method does not exist in the model, do nothing
        """
        m = req.session.model(model)
        try:
            return m.check_warning_on_save(id, req.context)

        except xmlrpclib.Fault as e:
            if 'AttributeError' in e.faultString:
                return False
            else:
                raise openerp.osv.osv.except_osv('Error', e.faultCode)

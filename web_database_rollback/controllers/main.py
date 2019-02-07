# -*- coding: utf-8 -*-
##############################################################################
#
#    Authors: Cojocaru Marcel (marcel.cojocaru@gmail.com)
#    Copyright (c) 2019 Cojocaru Aurelian Marcel PFA
#
#    This program is free software: you can redistribute it and/or modify
#    it under the terms of the GNU Affero General Public License as published
#    by the Free Software Foundation, either version 3 of the License, or
#    (at your option) any later version.
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
import openerp
import openerp.http as http
from openerp.http import request


class DBRollbackController(http.Controller):
    @http.route(
        '/web_database_rollback/activate',
        type='json', auth='none')
    def activate(self):
        registry = openerp.modules.registry.RegistryManager.get(
            request.session.db)
        if registry.test_cr == None:
            registry.enter_test_mode()
            registry.clear_caches()

    @http.route(
        '/web_database_rollback/rollback',
        type='json', auth='none')
    def rollback(self):
        registry = openerp.modules.registry.RegistryManager.get(
            request.session.db)
        if registry.test_cr != None:
            registry.leave_test_mode()
            registry.clear_caches()


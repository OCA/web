# -*- coding: utf-8 -*-
##############################################################################
#
#    This module copyright (C) 2015 Therp BV (<http://therp.nl>).
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
import StringIO
import base64
from openerp import http
from openerp.tools.misc import file_open


class WebFavicon(http.Controller):

    @http.route('/web_favicon/favicon', type='http', auth="none")
    def icon(self):
        request = http.request
        if 'uid' in request.env.context:
            user = request.env['res.users'].browse(request.env.context['uid'])
            company = user.sudo(user.id).company_id
        else:
            company = request.env['res.company'].search([], limit=1)
        favicon = company.favicon_backend
        favicon_mimetype = company.favicon_backend_mimetype
        if not favicon:
            favicon = file_open('web/static/src/img/favicon.ico')
            favicon_mimetype = 'image/x-icon'
        else:
            favicon = StringIO.StringIO(base64.b64decode(favicon))
        return request.make_response(
            favicon.read(), [('Content-Type', favicon_mimetype)])

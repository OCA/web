# -*- coding: utf-8 -*-
##############################################################################
#
#    Copyright (C) 2016 initOS GmbH (<http://www.initos.com>).
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

import openerp.modules.registry
import openerp.addons.web.http as openerpweb
from openerp.addons.web.controllers.main import db_monodb


class Database(openerpweb.Controller):
    _cp_path = "/web/background"

    # copy modified from addons/web/controllers/main.py: Binary.company_logo
    @openerpweb.httprequest
    def login_background_img(self, req, dbname=None):
        # TODO add etag, refactor to use /image code for etag
        uid = None
        if req.session._db:
            dbname = req.session._db
            uid = req.session._uid
        elif dbname is None:
            dbname = db_monodb(req)

        if not uid:
            uid = openerp.SUPERUSER_ID

        if not dbname:
            image_data = self.placeholder(req, 'background.png')
        else:
            try:
                # create an empty registry
                registry = openerp.modules.registry.Registry(dbname)
                with registry.cursor() as cr:
                    cr.execute("""SELECT c.login_background_img
                                    FROM res_users u
                               LEFT JOIN res_company c
                                      ON c.id = u.company_id
                                   WHERE u.id = %s
                               """, (uid,))
                    row = cr.fetchone()
                    if row and row[0]:
                        image_data = str(row[0]).decode('base64')
                    else:
                        image_data = self.placeholder(req, 'nobackground.png')
            except Exception:
                image_data = self.placeholder(req, 'background.png')

        headers = [
            ('Content-Type', 'image/png'),
            ('Content-Length', len(image_data)),
        ]
        return req.make_response(image_data, headers)

    @openerpweb.httprequest
    def display_login_logo(self, req, dbname=None):
        uid = None
        if req.session._db:
            dbname = req.session._db
            uid = req.session._uid
        elif dbname is None:
            dbname = db_monodb(req)

        if not uid:
            uid = openerp.SUPERUSER_ID

        if not dbname:
            display = 'False'
        else:
            try:
                # create an empty registry
                registry = openerp.modules.registry.Registry(dbname)
                with registry.cursor() as cr:
                    cr.execute("""SELECT c.display_login_logo
                                    FROM res_users u
                               LEFT JOIN res_company c
                                      ON c.id = u.company_id
                                   WHERE u.id = %s
                               """, (uid,))
                    row = cr.fetchone()
                    if row and row[0]:
                        display = str(row[0])
                    else:
                        display = 'False'
            except Exception:
                display = 'False'

        headers = [
            ('Content-Type', 'text/plain'),
            ('Content-Length', len(display)),
        ]
        return req.make_response(display, headers)

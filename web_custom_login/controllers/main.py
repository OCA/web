# -*- coding: utf-8 -*-
# © initOS GmbH 2013
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

from openerp.addons.web.controllers.main import db_monodb
import openerp.addons.web.http as openerpweb
import openerp.modules.registry


class Database(openerpweb.Controller):
    _cp_path = "/web/css"

    @openerpweb.httprequest
    def company_css(self, req, dbname=None):
        """Load style_css attribute of given company
        and return it as CSS document."""
        css = ''
        if dbname:
            try:
                # create an empty registry
                registry = openerp.modules.registry.Registry(dbname)
                with registry.cursor() as cr:
                    cr.execute("""SELECT c.style_css
                                    FROM res_users u
                               LEFT JOIN res_company c
                                      ON c.id = u.company_id
                                   WHERE u.id = %s
                               """, (openerp.SUPERUSER_ID,))
                    row = cr.fetchone()
                    if row and row[0]:
                        css = str(row[0])
            except Exception:
                pass

        headers = [
            ('Content-Type', 'text/css'),
        ]
        return req.make_response(css, headers)

    # copy modified from addons/web/controllers/main.py: Binary.company_logo
    @openerpweb.httprequest
    def company_login_logo(self, req, dbname=None):
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
            image_data = self.placeholder(req, 'logo.png')
        else:
            try:
                # create an empty registry
                registry = openerp.modules.registry.Registry(dbname)
                with registry.cursor() as cr:
                    cr.execute("""SELECT c.login_logo_web
                                    FROM res_users u
                               LEFT JOIN res_company c
                                      ON c.id = u.company_id
                                   WHERE u.id = %s
                               """, (uid,))
                    row = cr.fetchone()
                    if row and row[0]:
                        image_data = str(row[0]).decode('base64')
                    else:
                        image_data = self.placeholder(req, 'nologo.png')
            except Exception:
                image_data = self.placeholder(req, 'logo.png')

        headers = [
            ('Content-Type', 'image/png'),
            ('Content-Length', len(image_data)),
        ]
        return req.make_response(image_data, headers)

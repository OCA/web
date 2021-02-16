# Copyright 2015 Therp BV <http://therp.nl>
# Copyright 2017 QubiQ 2010 <http://www.qubiq.es>
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

import base64
from io import BytesIO

from odoo import http
from odoo.tools.misc import file_open


class WebFavicon(http.Controller):
    @http.route("/web_favicon/favicon", type="http", auth="none")
    def icon(self):
        request = http.request
        if "uid" in request.env.context:
            user = request.env["res.users"].browse(request.env.context["uid"])
            company = request.env.company.with_user(user)
        else:
            company = request.env["res.company"].search([], limit=1)
        favicon = company.favicon_backend
        favicon_mimetype = company.favicon_backend_mimetype
        if not favicon:
            favicon = file_open("web/static/src/img/favicon.ico", "rb")
            favicon_mimetype = "image/x-icon"
        else:
            favicon = BytesIO(base64.b64decode(favicon))
        return request.make_response(
            favicon.read(), [("Content-Type", favicon_mimetype)]
        )

# Copyright (C) 2018 Ventor, Xpansa Group (<https://ventor.tech/>)
# License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl.html).
from odoo import http
from odoo.addons.web.controllers.main import Home


class Main(Home):

    @http.route('/robots.txt', type='http', auth="none")
    def robots(self):
        return http.request.make_response(
            "User-agent: *\nDisallow: /",
            [('Content-Type', 'text/plain')],
        )

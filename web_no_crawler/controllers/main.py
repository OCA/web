# -*- coding: utf-8 -*-
# © 2018 Xpansa Group
# License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl.html).

from openerp import http


class Main(http.Controller):

    @http.route('/robots.txt', type='http', auth="none")
    def robots_txt(self):
        return http.request.make_response(
            "User-agent: *\nDisallow: /",
            [('Content-Type', 'text/plain')],
        )

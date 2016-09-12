# -*- coding: utf-8 -*-
# Copyright 2016 ThinkOpen Solutions
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

from openerp import http
from openerp.http import request, Controller

class WebSwitch(Controller):

    @http.route('/web/session/get_installed_languages', type='json', auth="user")
    def get_installed_languages(self):
        try:
            return [{'local_code': lang.code, 'iso_code': lang.iso_code}
                    for lang in request.env['res.lang'].search([])]
        except Exception, e:
            return {"error": e, "title": _("Languages")}

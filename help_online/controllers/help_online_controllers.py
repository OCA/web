# -*- coding: utf-8 -*-
# Copyright 2014 ACSONE SA/NV (<http://acsone.eu>)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

import openerp.http as http
from openerp.http import request


class HelpOnlineController(http.Controller):

    @http.route('/help_online/build_url', type='json', auth='user')
    def build_url(self, model, view_type, domain=None, context=None):
        help_online_model = request.env['help.online']
        return help_online_model.get_page_url(
            model, view_type, domain=domain, context=context)

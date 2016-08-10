# -*- coding: utf-8 -*-
# Copyright 2016 LasLabs Inc.
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

import json
from openerp import http
from openerp.http import request
from openerp.addons.web.controllers.main import DataSet


class DataSet(DataSet):

    @http.route('/web/dataset/search_read', type='json', auth="public")
    def search_read(self, *args, **kwargs):
        return super(DataSet, self).do_search_read(*args, **kwargs)

    @http.route('/web/dataset/load', type='json', auth="public")
    def load(self, *args, **kwargs):
        return super(DataSet, self).load(*args, **kwargs)

    @http.route('/web/dataset/call', type='json', auth="public")
    def call(self, *args, **kwargs):
        return super(DataSet, self).call(*args, **kwargs)

    @http.route(
        ['/web/dataset/call_kw', '/web/dataset/call_kw/<path:path>'],
        type='json',
        auth="public"
    )
    def call_kw(self, *args, **kwargs):
        return super(DataSet, self).call_kw(*args, **kwargs)

    @http.route('/web/dataset/call_button', type='json', auth="public")
    def call_button(self, *args, **kwargs):
        return super(DataSet, self).call_button(*args, **kwargs)

    @http.route('/web/dataset/exec_workflow', type='json', auth="public")
    def exec_workflow(self, *args, **kwargs):
        return super(DataSet, self).exec_workflow(*args, **kwargs)

    @http.route('/web/dataset/resequence', type='json', auth="public")
    def resequence(self, *args, **kwargs):
        return super(DataSet, self).resequence(*args, **kwargs)

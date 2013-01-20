# -*- coding: utf-8 -*-
try:
    import json
except ImportError:
    import simplejson as json

import web.common.http as openerpweb

from web.controllers.main import ExcelExport


class ExcelExportView(ExcelExport):
    _cp_path = '/web/export/xls_view'

    @openerpweb.httprequest
    def index(self, req, data, token):
        data = json.loads(data)
        model = data.get('model',[])
        columns_headers = data.get('headers',[])
        rows = data.get('rows',[])

        context = req.session.eval_context(req.context)

        return req.make_response(self.from_data(columns_headers, rows),
            headers=[('Content-Disposition', 'attachment; filename="%s"' % self.filename(model)),
                     ('Content-Type', self.content_type)],
            cookies={'fileToken': int(token)})
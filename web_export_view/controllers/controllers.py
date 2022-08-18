# Copyright 2016 Henry Zhou (http://www.maxodoo.com)
# Copyright 2016 Rodney (http://clearcorp.cr/)
# Copyright 2012 Agile Business Group
# Copyright 2012 Therp BV
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

import json

import odoo.http as http
from odoo.http import request

from odoo.addons.web.controllers.main import ExcelExport


class ExcelExportView(ExcelExport):
    def __getattribute__(self, name):
        if name == "fmt":
            return super(ExcelExportView, self).__getattribute__(name)
        raise AttributeError()

    @http.route("/web/export/xls_view", type="http", auth="user")
    def export_xls_view(self, data, token):
        data = json.loads(data)
        # model = data.get("model", [])
        # columns_headers = data.get("headers", [])
        # rows = data.get("rows", [])

        return request.make_response(
            self.from_data(data.get("headers", []), data.get("rows", [])),
            headers=[
                (
                    "Content-Disposition",
                    'attachment; filename="%s"' % self.filename(data.get("model", [])),
                ),
                ("Content-Type", self.content_type),
            ],
            cookies={"fileToken": token},
        )

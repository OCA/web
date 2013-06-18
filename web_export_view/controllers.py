# -*- coding: utf-8 -*-
##############################################################################
#    
#    Copyright (C) 2012 Agile Business Group sagl (<http://www.agilebg.com>)
#    Copyright (C) 2012 Domsense srl (<http://www.domsense.com>)
#
#    This program is free software: you can redistribute it and/or modify
#    it under the terms of the GNU Affero General Public License as published
#    by the Free Software Foundation, either version 3 of the License, or
#    (at your option) any later version.
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
import re
import xlwt
from cStringIO import StringIO

try:
    import json
except ImportError:
    import simplejson as json

import web.common.http as openerpweb

from web.controllers.main import ExcelExport


class ExcelExportView(ExcelExport):
    _cp_path = '/web/export/xls_view'

    def from_data(self, fields, rows, separators):
        workbook = xlwt.Workbook()
        worksheet = workbook.add_sheet('Sheet 1')

        for i, fieldname in enumerate(fields):
            worksheet.write(0, i, fieldname)
            worksheet.col(i).width = 8000 # around 220 pixels

        style = xlwt.easyxf('align: wrap yes')
        m =  "^[\d%s]+(\%s\d+)?$" % (separators['thousands_sep'], separators['decimal_point'])
        for row_index, row in enumerate(rows):
            for cell_index, cell_value in enumerate(row):
                if isinstance(cell_value, basestring):
                    cell_value = re.sub("\r", " ", cell_value)
                    if re.match(m, cell_value):
                        cell_value = float(cell_value.replace(separators['thousands_sep'],'')replace(separators['decimal_point'],'.'))
                        style = xlwt.easyxf(num_format_str='#,##0.00')
                if cell_value is False: cell_value = None
                worksheet.write(row_index + 1, cell_index, cell_value, style)

        fp = StringIO()
        workbook.save(fp)
        fp.seek(0)
        data = fp.read()
        fp.close()
        return data    

    @openerpweb.httprequest
    def index(self, req, data, token):
        data = json.loads(data)
        model = data.get('model',[])
        columns_headers = data.get('headers',[])
        rows = data.get('rows',[])

        context = req.session.eval_context(req.context)
        lang = context.get('lang', 'en_US')
        Model = req.session.model('res.lang')
        ids = Model.search([['code','=',lang]])
        record = Model.read(ids, ['decimal_point','thousands_sep'])

        return req.make_response(self.from_data(columns_headers, rows, record[0]),
            headers=[('Content-Disposition', 'attachment; filename="%s"' % self.filename(model)),
                     ('Content-Type', self.content_type)],
            cookies={'fileToken': int(token)})

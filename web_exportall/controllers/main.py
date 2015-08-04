# -*- encoding: utf-8 -*-
##############################################################################
#
#    Copyright (C) 2012-2015 credativ Ltd (<http://credativ.co.uk>).
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
import csv
import operator
import simplejson
import re
from cStringIO import StringIO
try:
    import xlwt
except ImportError:
    xlwt = None

from openerp import sql_db, api
from openerp.addons.web.controllers.main import (ExportFormat,
                                                 serialize_exception)
from openerp import http
from openerp.http import request


def iter_ids(all_ids, step_size=250):
    """ Splits all_ids into more manageable chunks of
        size step_size and yields them """
    for offset in xrange(0, len(all_ids), step_size):
        id_set = all_ids[offset:offset+step_size]
        if not id_set:
            break
        yield id_set


def iter_data(Model, dbname, uid, all_ids, field_names, raw_data, context):
    """ Reads data in chunks of ids from all_ids and
        yields the rows one by one """
    with sql_db.db_connect(dbname).cursor() as cr, api.Environment.manage():
        for ids in all_ids:
            import_data = Model.export_data(
                cr, uid, ids, field_names, raw_data, context=context
            ).get('datas', [])
            for data in import_data:
                yield data


class ExportAllBase(ExportFormat):
    raw_data = False

    def base(self, data, token):
        data_dict = simplejson.loads(data)
        model = data_dict.get('model', False)
        fields = data_dict.get('fields', [])
        ids = data_dict.get('ids', [])
        domain = data_dict.get('domain', False)
        import_compat = data_dict.get('import_compat', False)
        context = data_dict.get('context', request.context)

        field_names = map(operator.itemgetter('name'), fields)

        Model = request.registry.get(model)
        ids = iter_ids(Model.search(
            request.cr, request.uid, domain, context=context
        ))
        import_data = iter_data(
            Model, request.cr.dbname, request.uid, ids, field_names,
            self.raw_data, context
        )

        if import_compat:
            columns_headers = field_names
        else:
            columns_headers = [val['label'].strip() for val in fields]

        return request.make_response(
            self.from_data(columns_headers, import_data),
            headers=[('Content-Disposition',
                     'attachment; filename="%s"'
                      % self.filename(model)),
                     ('Content-Type', self.content_type)],
            cookies={'fileToken': token}
        )


class CSVExportAll(ExportAllBase, http.Controller):

    @property
    def content_type(self):
        return 'text/csv;charset=utf8'

    def filename(self, base):
        return base + '.csv'

    @http.route('/web/export/csv_all', type='http', auth="user")
    @serialize_exception
    def index(self, data, token):
        return self.base(data, token)

    def from_data(self, fields, rows):
        fp = StringIO()
        writer = csv.writer(fp, quoting=csv.QUOTE_ALL)

        writer.writerow([name.encode('utf-8') for name in fields])

        for data in rows:
            row = []
            for d in data:
                if isinstance(d, basestring):
                    d = d.replace('\n', ' ').replace('\t', ' ')
                    try:
                        d = d.encode('utf-8')
                    except UnicodeError:
                        pass
                if d is False:
                    d = None
                row.append(d)
            writer.writerow(row)

            if fp.tell() >= 1250:
                fp.seek(0)
                data = fp.read()
                yield data
                fp.seek(0)
                fp.truncate()
                row = []

        fp.seek(0)  # Flush the final data
        data = fp.read()
        fp.close()
        yield data
        return


class ExcelExportAll(ExportAllBase, http.Controller):
    raw_data = True

    @property
    def content_type(self):
        return 'application/vnd.ms-excel'

    def filename(self, base):
        return base + '.xls'

    @http.route('/web/export/xls_all', type='http', auth="user")
    @serialize_exception
    def index(self, data, token):
        return self.base(data, token)

    # Unable to yield the workbook as we create it
    # as all data must be known on save
    def from_data(self, fields, rows):
        workbook = xlwt.Workbook()
        worksheet = workbook.add_sheet('Sheet 1')

        for i, fieldname in enumerate(fields):
            worksheet.write(0, i, fieldname)
            worksheet.col(i).width = 8000  # around 220 pixels

        style = xlwt.easyxf('align: wrap yes')

        for row_index, row in enumerate(rows):
            for cell_index, cell_value in enumerate(row):
                if isinstance(cell_value, basestring):
                    cell_value = re.sub("\r", " ", cell_value)
                if cell_value is False:
                    cell_value = None
                worksheet.write(row_index + 1, cell_index, cell_value, style)

        fp = StringIO()
        workbook.save(fp)
        fp.seek(0)
        data = fp.read()
        fp.close()
        return data

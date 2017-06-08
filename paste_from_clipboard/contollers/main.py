# -*- coding: utf-8 -*-

from openerp import http, SUPERUSER_ID
from openerp.http import request


class PasteFromClipboard(http.Controller):

    @http.route('/paste_from_clipboard/get_records', type='json', auth="user")
    def get_records(self, fields, data, o2m_model, hidden_fields):
        """
        :param fields: list of dict, [{field:product_id,type:many2one,relation:product.product},{field:qty,type:float,relation:None}]
        :param data: list of list, table list matrix [[pen,10],[paper,2]]
        :return:list of list of dict, [0,false,{product_id=12,qty=10}],[0,false,{product_id=15,qty=2}]
        """
        # 1. get ID from name for many2one fields
        fields_count = len(fields)
        if any(f['type'] == 'many2one' for f in fields):
            m2o_name_list = [None]*fields_count
            cr, uid, context = request.cr, request.uid, request.context
            for i in xrange(fields_count):
                if fields[i]['type'] == 'many2one':
                    name = [rows[i] for rows in data]
                    model = request.registry[fields[i]['relation']]
                    records = model.search_read(cr, SUPERUSER_ID, [('name', 'in', name)], ['name'], context=context)
                    m2o_name_list[i] = records
        # 2. get default values for hidden fields
        Model = request.session.model(o2m_model)   # use request.session.model instead of request.registry ,otherwise no cr in context
        defaults = Model.default_get(hidden_fields, context)
        rows_count = len(data)
        result = []
        for j in xrange(rows_count):
            record = {}
            skip = False
            for k in xrange(fields_count):
                if data[j][k]:
                    field_value = False
                    field_type = fields[k].get('type', '')
                    if field_type:
                        if field_type == 'many2one':
                            # consider field type int as name field
                            match = next((rec for rec in m2o_name_list[k] if (lambda a: str(a) if isinstance(a,int) else a)(rec['name']) == data[j][k]), None)
                            if match:
                                field_value = match['id']
                            else:
                                skip = True   # skip records with name not found
                        elif field_type == 'float':
                            field_value = float(data[j][k])
                        elif field_type == 'integer':
                            field_value = int(data[j][k])
                        else:
                            field_value = data[j][k]
                        if field_value:
                            record.update({fields[k].get('field'):field_value})
            if not skip:
                record.update(defaults)
                result.append([0, False, record])
        return result

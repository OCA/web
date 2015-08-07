# -*- coding: utf-8 -*-
##############################################################################
#
#    OpenERP, Open Source Management Solution
#    Copyright (C) 2014-2015 initOS GmbH & Co. KG (<http://www.initos.com>).
#    Author Nikolina Todorova <nikolina.todorova@initos.com>
#
#    This program is free software: you can redistribute it and/or modify
#    it under the terms of the GNU Affero General Public License as
#    published by the Free Software Foundation, either version 3 of the
#    License, or (at your option) any later version.
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
from openerp.osv import fields, orm, osv
from openerp import SUPERUSER_ID
from openerp.tools.translate import _
from lxml import etree
import os
import sys
import logging
import hashlib

_logger = logging.getLogger(__name__)


class additional_field(orm.AbstractModel):
    _name = 'additional.field'
    _description = 'Functionality for automatically adding field in the view'

    def fields_view_get(self, cr, uid, view_id=None, view_type='form',
                        context=None, toolbar=False, submenu=False):
        # override of fields_view_to create new field for every 'specialbinary;
        # field and add the filename attr
        if context is None:
            context = {}
        res = super(additional_field,
                    self).fields_view_get(cr,
                                          uid,
                                          view_id=view_id,
                                          view_type=view_type,
                                          context=context,
                                          toolbar=toolbar,
                                          submenu=submenu)

        doc = etree.XML(res['arch'])
        for node in doc.xpath("//field[@specialbinary='1']"):
            field_name = node.get('name')
            new_field_name = field_name + '_name'
            field_string = res['fields'][field_name]['string'] or ''
            # FIXME: In fact this is not exact. Actually we only want to move
            # the value for 'required' to the new field,
            # if the value is not false.
            # Unfortunately the value can be something like
            # '[["state", "=", "confirmed"]]', so matching it is not trivial.
            modifiers = node.get('modifiers')[1:-1]
            if modifiers:
                modifiers += ', '
            modifiers += '"invisible": true'
            node.set('modifiers', '{}')
            node.set('filename', new_field_name)

            new_field = etree.Element('field')
            new_field.set('name', new_field_name)
            new_field.set('invisible', '1')
            new_field.set('modifiers', '{' + modifiers + '}')
            res['fields'][new_field_name] = \
                {'string': field_string, 'type': 'char'}

            node.getparent().append(new_field)
        res['arch'] = etree.tostring(doc)
        return res


class Storage(object):

    def __init__(self, cr, uid, record, field_name):
        self.cr = cr
        self.uid = uid
        self.pool = record._model.pool
        self.field_key = \
            ("%s-%s" % (record._name, field_name)).replace('.', '')
        base_location = self.pool.get('ir.config_parameter').\
            get_param(cr, uid, 'binary.location')

        if base_location:
            self.base_location = base_location
            self.location = (self.base_location, self.field_key)
        else:
            self.base_location = None
            self.location = None

    def add(self, value):
        if not value:
            return {}
        file_size = sys.getsizeof(value.decode('base64'))
        binary_uid = self.pool['ir.attachment'].\
            _file_write(self.cr, self.uid, self.location, value)
        _logger.debug('Add binary %s/%s' % (self.field_key, binary_uid))
        return {
            'binary_uid': binary_uid,
            'file_size': file_size,
            }

    def get(self, binary_uid):
        return self.pool['ir.attachment'].\
            _file_read(self.cr, self.uid, self.location, binary_uid)


class versionedAttachment(fields.function):

    def __init__(self, string, filters=None, get_storage=Storage, **kwargs):
        new_kwargs = {
            'type': 'binary',
            'string': string,
            'fnct': self._fnct_read,
            'fnct_inv': self._fnct_write,
            'multi': False,
            }
        new_kwargs.update(kwargs)
        self.filters = filters
        self.get_storage = get_storage
        super(versionedAttachment, self).__init__(**new_kwargs)

    # No postprocess are needed
    # we already take care of bin_size option in the context
    def postprocess(self, cr, uid, obj, field, value=None, context=None):
        return value

    def _fnct_write(self, obj, cr, uid, ids, field_name, value, args,
                    context=None):

        if value:
            if not isinstance(ids, (list, tuple)):
                ids = [ids]

            if self._fnct_inv_arg:
                filename_field = self._fnct_inv_arg
            else:
                filename_field = field_name + "_name"

            for record in obj.browse(cr, uid, ids, context=context):
                if filename_field in record and record[filename_field]:
                    if record[filename_field].endswith('.pdf') is not True:
                        raise osv.except_osv(_(u'File type'),
                                             u'Only pdf files can be attached')
                        return False

            for record in obj.browse(cr, uid, ids, context=context):
                db_fields = {}
                storage = self.get_storage(cr, uid, record, field_name)
                file_obj = storage.pool.get('ir.attachment')
                old_file_ids = file_obj.search(cr,
                                               uid,
                                               args=['&',
                                                     ('field_name',
                                                      '=',
                                                      field_name),
                                                     ('res_id',
                                                      '=',
                                                      record.id),
                                                     ('version', '=', 'new')
                                                     ]
                                               )

                if old_file_ids:
                    # write with superuser rights because there is
                    # a rights check in document/document.py:80
                    # requires that the user has write rights to
                    # document.directory even if no actual write happens
                    file_obj.write(cr, SUPERUSER_ID,
                                   old_file_ids, {'version': 'old'})

                if storage.base_location:
                    res = storage.add(value)
                else:
                    bin_value = value.decode('base64')
                    fname = hashlib.sha1(bin_value).hexdigest()
                    fname = fname[:3] + '/' + fname
                    res = {'binary_uid': fname, 'file_size': None}
                    db_fields['datas'] = value

                file_ids = file_obj.search(cr,
                                           uid,
                                           args=['&',
                                                 ('field_name',
                                                  '=',
                                                  field_name),
                                                 ('res_id',
                                                  '=',
                                                  ids[0]),
                                                 ('store_fname',
                                                  '=',
                                                  res['binary_uid'])
                                                 ]
                                           )
                if file_ids:
                    # write with superuser rights because there is
                    # a rights check in document/document.py:80
                    # requires that the user has write rights to
                    # document.directory even if no actual write happens
                    file_obj.write(cr, SUPERUSER_ID,
                                   file_ids[0], {'version': 'new'})
                    continue

                ir__model_fields = storage.pool.get('ir.model.fields')
                field_obj_id = ir__model_fields.search(cr, uid,
                                                       args=[('name',
                                                              '=',
                                                              field_name)])
                field_obj = ir__model_fields.browse(cr, uid, field_obj_id)

                if field_obj and 'field_description' in field_obj[0]:
                    db_fields['name'] = field_obj[0].field_description

                # calc code: use code of last attachment
                # (each version should have the same code),
                # highest id is the latest in most of the cases
                code = ''
                if old_file_ids:
                    code = file_obj.read(cr, uid, max(old_file_ids),
                                         fields_to_read=['code'],
                                         context=context)[0]['code']
                db_fields['datas_fname'] = record[filename_field]
                db_fields['store_fname'] = res['binary_uid']
                db_fields['file_size'] = res['file_size']
                db_fields['res_id'] = ids[0]
                db_fields['version'] = "new"
                db_fields['res_model'] = obj._name
                db_fields['field_name'] = field_name
                db_fields['code'] = code
                storage.pool['ir.attachment'].create(cr, uid, db_fields,
                                                     context=context)
            return True

    def _fnct_read(self, obj, cr, uid, ids, field_name, args, context=None):
        result = {}
        for record in obj.browse(cr, uid, ids, context=context):
            storage = self.get_storage(cr, uid, record, field_name)
            file_obj = storage.pool.get('ir.attachment')
            file_ids = file_obj.search(cr, uid, args=['&',
                                                      ('field_name',
                                                       '=',
                                                       field_name),
                                                      ('res_id',
                                                       '=',
                                                       record.id),
                                                      ('version', '=', 'new')
                                                      ]
                                       )
            if file_ids:
                file_val = file_obj.browse(cr, uid, file_ids)
                binary_uid = file_val[0]['store_fname']
            else:
                binary_uid = None
            if binary_uid:
                if not storage.base_location:
                    result[record.id] = file_val[0]['db_datas']
                else:
                    result[record.id] = storage.get(binary_uid)
            else:
                result[record.id] = None

        return result


class ir_attachment(orm.Model):
    _inherit = 'ir.attachment'

    _columns = {
        'version': fields.char('Version'),
        'field_name': fields.char('Field name'),
        'code': fields.char('Code'),
        'delay_dummy_datas': fields.binary('File Content',
                                           help='Including this field into a '
                                           'view allows to postpone the '
                                           'loading of data until it\'s '
                                           'really needed, i.e., the user '
                                           'clicks on the Download link')
    }

    def _full_path(self, cr, uid, location, path):
        # Hack for passing the field_key in the full path
        # For now I prefer to use this hack and to reuse
        # the ir.attachment code
        # An alternative way will to copy/paste and
        # adapt the ir.attachment code
        if isinstance(location, tuple):
            base_location, field_key = location
            path = os.path.join(field_key, path)
        else:
            base_location = location
        return super(ir_attachment, self).\
            _full_path(cr, uid, base_location, path)


fields.versionedAttachment = versionedAttachment
original__init__ = orm.BaseModel.__init__


def __init__(self, pool, cr):
    original__init__(self, pool, cr)
    if self.pool.get('extended.binary.field.installed'):
        additionnal_field = {}

        for field in self._columns:
            if isinstance(self._columns[field], versionedAttachment):
                additionnal_field.update({
                    '%s_name' % field:
                        fields.char('%s name' % self._columns[field].string),
                    })

        self._columns.update(additionnal_field)

orm.BaseModel.__init__ = __init__


class EgovernmentFieldInstalled(orm.AbstractModel):
    _name = 'extended.binary.field.installed'

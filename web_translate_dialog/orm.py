# -*- coding: utf-8 -*-
##############################################################################
#
#    Author: Guewen Baconnier
#    Copyright 2012-2013 Camptocamp SA
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

import openerp.osv.orm


# add the method in the orm so we can use it from the TranslateDialog of the
# webclient instead of the normal read
def read_translations(self, cr, user, ids, fields=None, context=None, load='_classic_read'):
    """ Read records with given ids with the given fields, if a field is not
    translated, its value will be False instead of the source language's value.

    :param fields: optional list of field names to return (default: all fields would be returned)
    :type fields: list (example ['field_name_1', ...])
    :return: list of dictionaries((dictionary per record asked)) with requested field values
    :rtype: [{‘name_of_the_field’: value, ...}, ...]
    :raise AccessError: * if user has no read rights on the requested object
                        * if user tries to bypass access rules for read on the requested object

    """

    if context is None:
        context = {}
    self.check_access_rights(cr, user, 'read')
    fields = self.check_field_access_rights(cr, user, 'read', fields)
    if isinstance(ids, (int, long)):
        select = [ids]
    else:
        select = ids
    select = map(lambda x: isinstance(x, dict) and x['id'] or x, select)
    result = self._read_flat(cr, user, select, fields, context, load)

    if context.get('lang') and context['lang'] != 'en_US':
        fields_pre = [f for f in fields if
                      (f in self._columns and
                       getattr(self._columns[f], '_classic_write'))] + \
                     self._inherits.values()

        for f in fields_pre:
            if self._columns[f].translate:
                res_ids = [x['id'] for x in result]
                res_trans = self.pool.get('ir.translation')._get_ids(
                    cr, user,
                    self._name + ',' + f,
                    'model',
                    context['lang'],
                    res_ids)
                for r in result:
                    if not res_trans.get(r['id']):
                        r[f] = None

    for r in result:
        for key, v in r.iteritems():
            if v is None:
                r[key] = False

    if isinstance(ids, (int, long, dict)):
        return result and result[0] or False
    return result

openerp.osv.orm.BaseModel.read_translations = read_translations

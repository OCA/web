# -*- coding: utf-8 -*-
##############################################################################
#
#    Author: Guewen Baconnier
#    Copyright 2012 Camptocamp SA
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


# Check if we can remove the monkey-patching once the bug:
# https://bugs.launchpad.net/bugs/1053970
# is resolved.
original_create = openerp.osv.orm.BaseModel.create
def create(self, cr, uid, vals, context=None):
    """
    Monkey-patch the create of BaseModel in order to create translation lines
    on translatable fields.

    Actually, the original behavior is quite strange. Here it is:
        I'm logged in with en_US language.
        I create a record, with a (translatable) title 'My title'
        I check the source in database (table of the object), that's 'My title'
        I check the translation lines for the en_US language, no line
        I write on my record the title 'My title updated'
        I check the source in database, that's 'My title updated'
        I check the translation lines for the en_US language, no line

        I'm logged in with fr_FR language
        I create a record, with a (translatable) title 'Mon titre'
        I check the source in database (table of the object), that's 'Mon titre'
        I check the translation lines for the fr_FR language, no line
        I write on my record the title 'Mon titre mis à jour'
        I check the source in database, that's 'Mon titre' (unchanged)
        I check the translation lines for the fr_FR language, I have a line with 'Mon titre mis à jour'

    As you can see, the write method create translation lines for other
    languages than en_US, that's correct. The create method does not,
    and it has to do it.

    OpenERP seems to assume that the en_US should be the reference
    language, so lets assume it completely, and generate the french
    translation line directly when we enter the value.

    That's weird, because, if I create a record in french, the source
    will be the french value (of course), but programmatically, I do not
    have any means to know that someone entered a french translation.

    A simple scenario where the bug will occurs:

        User A is logged in with fr_FR
        User A creates a product with a name 'Marteau'
        User B is logged in with en_US
        User B modifies the product 'Marteau' to be 'Hammer'
        => The french translation is lost.

    It won't occurs in this slightly modified scenario:

        User A is logged in with fr_FR
        User A creates a product with a name 'Martea' (typo)
        User A modifies the product 'Martea' to be 'Marteau'
        User B is logged in with en_US
        User B modifies the product 'Marteau' to be 'Hammer'
        => The french translation isn't lost, because the write has
        correctly generated the french translation line


    Bug reported : https://bugs.launchpad.net/bugs/1053970

    """
    if context is None:
        context = {}

    record_id = original_create(self, cr, uid, vals, context=context)

    if context.get('lang') and context['lang'] != 'en_US':
        translate_fields = [field for field in vals if
                field in self._columns and
                self._columns[field].translate and
                self._columns[field]._classic_write and
                not hasattr(self._columns[field], '_fnct_inv')]

        for field in translate_fields:
            src_trans = self.read(cr, uid, record_id, [field])[field]
            if not src_trans:
                src_trans = vals[field]
                # Inserting value to DB
                self.write(cr, uid, record_id, {field: vals[field]})
            self.pool.get('ir.translation')._set_ids(
                    cr, uid,
                    self._name + ',' + field,
                    'model',
                    context['lang'],
                    [record_id],
                    vals[field],
                    src_trans)

    return record_id

openerp.osv.orm.BaseModel.create = create


# add the method in the orm so we can use it from the TranslateDialog of the
# webclient
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
    self.check_read(cr, user)
    if not fields:
        fields = list(set(self._columns.keys() + self._inherit_fields.keys()))
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


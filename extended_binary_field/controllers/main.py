# -*- coding: utf-8 -*-
##############################################################################
#
#    OpenERP, Open Source Management Solution
#    Copyright (C) 2014-2015 initOS GmbH(<http://www.initos.com>).
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
from openerp.addons.web.controllers import main
import simplejson
from openerp.addons.web import http
openerpweb = http


class Binary(main.Binary):

    @openerpweb.httprequest
    def saveas(self, req, model, field, id=None, filename_field=None, **kw):
        """ Download link for files stored as binary fields.

        If the ``id`` parameter is omitted, fetches the default value for the
        binary field (via ``default_get``), otherwise fetches the field for
        that precise record.

        :param req: OpenERP request
        :type req: :class:`web.common.http.HttpRequest`
        :param str model: name of the model to fetch the binary from
        :param str field: binary field
        :param str id: id of the record from which to fetch the binary
        :param str filename_field: field holding the file's name, if any
        :returns: :class:`werkzeug.wrappers.Response`
        """
        field = field.replace('delay_dummy_', '')
        return super(Binary, self).saveas(
            req,
            model,
            field,
            id=id,
            filename_field=filename_field,
            **kw
            )

    @openerpweb.httprequest
    def saveas_ajax(self, req, data, token):
        jdata = simplejson.loads(data)
        field = jdata['field']
        field = field.replace('delay_dummy_', '')
        jdata['field'] = field
        data = simplejson.dumps(jdata)
        return super(Binary, self).saveas_ajax(req, data, token)

# vim:expandtab:tabstop=4:softtabstop=4:shiftwidth=4:

# -*- coding: utf-8 -*-
##############################################################################
#
#    Copyright 2014 Agent ERP GmbH
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
#
##############################################################################

import base64
import functools
import logging
import simplejson
import werkzeug.utils
from openerp import http
from openerp.http import request, serialize_exception as _serialize_exception

_logger = logging.getLogger(__name__)

def serialize_exception(f):
    @functools.wraps(f)
    def wrap(*args, **kwargs):

        try:
            return f(*args, **kwargs)
        except Exception, e:
            _logger.exception("An exception occured during an http request")
            se = _serialize_exception(e)
            error = {
                'code': 200,
                'message': "Odoo Server Error",
                'data': se
            }
            return werkzeug.exceptions.InternalServerError(simplejson.dumps(error))
    return wrap

#----------------------------------------------------------
# OpenERP Web web Controllers
#----------------------------------------------------------
class Binary(http.Controller):

    @http.route('/ddup/binary/upload', type='http', auth="user")
    @serialize_exception
    def upload(self, callback, ufile):
        print "controller upload file"
        # TODO: might be useful to have a configuration flag for max-length file uploads
        out = """<script language="javascript" type="text/javascript">
                    var win = window.top.window;
                    win.jQuery(win).trigger(%s, %s);
                </script>"""
        try:
            data = ufile.read()
            args = [len(data), ufile.filename,
                    ufile.content_type, base64.b64encode(data)]
        except Exception, e:
            args = [False, e.message]
        return out % (simplejson.dumps(callback), simplejson.dumps(args))


    @http.route('/ddup/binary/upload_attachment', type='http', auth="user")
    def upload_attachment(self, callback, model, id, ufile):
        Model = request.session.model('ir.attachment')
        out = """<script language="javascript" type="text/javascript">
                    var win = window.top.window;
                    win.jQuery(win).trigger(%s, %s);
                </script>"""
        try:
            res = {
                'name': ufile.filename,
                'datas': base64.encodestring(ufile.read()),
                'datas_fname': ufile.filename,
                'res_model': model,
                'res_id': int(id)
            }
            attachment_id = Model.create(res, request.context)
            args = {
                'filename': ufile.filename,
                'id':  attachment_id
            }
        except Exception:
            args = {'error': "Something horrible happened"}
        return out % (simplejson.dumps(callback), simplejson.dumps(args))


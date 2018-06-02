# -*- coding: utf-8 -*-
import json
import base64
import logging


from odoo import http
from odoo.http import request

_logger = logging.getLogger(__name__)


class UploadAttachment(http.Controller):

    @http.route('/upload_attachment', type='http', auth="user", csrf=False)
    def file_upload(self, **post):
        Model = request.env['ir.attachment']
        try:
            filename = post.get("ufile").filename
            vals = {
                'name': filename,
                'datas_fname': filename,
                'datas': base64.encodestring(post.get("ufile").read()),
                'db_datas': post.get("ufile").read(),
                'res_model': post.get("model", ''),
                'res_id': int(post.get("id", '0')),
                'type': 'binary',
            }
            Model.create(vals)
            return json.dumps({'success': True})
        except Exception, e:
            _logger.exception(e.message)
            return json.dumps({'success': False,
                               'error': "Something wrong happened."})

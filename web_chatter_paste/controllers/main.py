# -*- coding: utf-8 -*-
# Copyright 2017 Onestein (<http://www.onestein.eu>)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from odoo import http
from odoo.http import request
from json import dumps


class ChatterPasteController(http.Controller):

    @http.route('/web_chatter_paste/upload_attachment', type='http',
                auth="user")
    def upload_attachment(self, callback, model, id, filename, mimetype,
                          content):
        model_obj = request.env['ir.attachment']
        out = """<script language="javascript" type="text/javascript">
                    var win = window.top.window;
                    win.jQuery(win).trigger(%s, %s);
                </script>"""
        attachment = model_obj.create({
            'name': filename,
            'datas': content,
            'datas_fname': filename,
            'res_model': model,
            'res_id': int(id)
        })
        args = {
            'filename': filename,
            'mimetype': mimetype,
            'id':  attachment.id
        }
        return out % (dumps(callback), dumps(args))

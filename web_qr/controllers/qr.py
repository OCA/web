import werkzeug
from odoo import http
from odoo.http import request


class Home(http.Controller):

    @http.route('/report/qr', type='http', auth="public")
    def report_qr(self, value, box_size=3, border=3, **kwargs):
        try:
            barcode = request.env['ir.actions.report'].qr_generate(
                value, box_size=box_size, border=border, **kwargs)
        except (ValueError, AttributeError):
            raise werkzeug.exceptions.HTTPException(
                description='Cannot convert into barcode.')
        return request.make_response(
            barcode, headers=[('Content-Type', 'image/png')])

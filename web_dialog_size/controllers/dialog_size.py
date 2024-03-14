# See LICENSE file for full copyright and licensing details.

from odoo import http
from odoo.http import request
from odoo.tools.safe_eval import const_eval


class portalcustomer(http.Controller):
    @http.route(["/dialogsize"], type="json", auth="public", website=True)
    def get_web_dialog_size_config(self):
        get_param = request.env["ir.config_parameter"].sudo().get_param
        return {
            "default_maximize": const_eval(
                get_param("web_dialog_size.default_maximize", "False")
            )
        }

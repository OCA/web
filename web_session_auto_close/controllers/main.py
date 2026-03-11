# Copyright 2025 ACSONE SA/NV
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

from odoo import http
from odoo.http import request


class WebSessionAutoCloseController(http.Controller):
    @http.route("/web/session/get_timeout", type="jsonrpc", auth="user")
    def get_session_timeout(self):
        default_sec = 600
        timeout_sec = (
            request.env["ir.config_parameter"]
            .sudo()
            .get_param("web_session_auto_close.timeout", default_sec)
        )
        try:
            timeout_int = int(timeout_sec)
        except (TypeError, ValueError):
            timeout_int = default_sec

        return timeout_int * 1000

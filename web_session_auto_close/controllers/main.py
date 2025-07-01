# Copyright 2025 ACSONE SA/NV
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

from odoo import http
from odoo.http import request


class WebSessionAutoCloseController(http.Controller):
    @http.route("/web/session/get_timeout", type="json", auth="user")
    def get_session_timeout(self):
        timeout_sec = (
            request.env["ir.config_parameter"]
            .sudo()
            .get_param("web_session_auto_close.timeout", 600)
        )
        return int(timeout_sec) * 1000

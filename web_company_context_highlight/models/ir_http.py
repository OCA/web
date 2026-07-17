# Copyright 2026 Acsone
# @author Pierre Verkest <pierre.verkest@apycod.fr>
# License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl).

from odoo import models


class IrHttp(models.AbstractModel):
    _inherit = "ir.http"

    def session_info(self):
        session = super().session_info()
        highlight_color = (
            self.env["ir.config_parameter"]
            .sudo()
            .get_param("web_company_context_highlight.color", "#ffc107")
        )
        text_color = (
            self.env["ir.config_parameter"]
            .sudo()
            .get_param("web_company_context_highlight.text_color", "#212529")
        )
        session["web_company_context_highlight_color"] = highlight_color
        session["web_company_context_highlight_text_color"] = text_color
        return session

# Copyright 2026 Acsone
# @author Pierre Verkest <pierre.verkest@apycod.fr>
# License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl).

from odoo import models


class IrHttp(models.AbstractModel):
    _inherit = "ir.http"

    def session_info(self):
        session = super().session_info()
        # ir.config_parameter.get_param() was removed in 20.0, use typed getters
        config = self.env["ir.config_parameter"].sudo()
        session["web_company_context_highlight_color"] = config.get_str(
            "web_company_context_highlight.color", "#ffc107"
        )
        session["web_company_context_highlight_text_color"] = config.get_str(
            "web_company_context_highlight.text_color", "#212529"
        )
        return session

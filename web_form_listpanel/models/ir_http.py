# Copyright 2026 Roberto Fichera
# License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl.html).

from odoo import models


class IrHttp(models.AbstractModel):
    _inherit = "ir.http"

    def session_info(self):
        result = super().session_info()
        if self.env.user._is_internal():
            result["web_form_listpanel_auto_panel"] = bool(
                self.env["ir.config_parameter"]
                .sudo()
                .get_param("web_form_listpanel.auto_panel")
            )
        return result

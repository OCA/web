# Copyright 2026 Jarsa
# License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl).
from odoo import models

PARAM_ROWS = "web_x2many_list_scroll.rows"


class IrHttp(models.AbstractModel):
    _inherit = "ir.http"

    def session_info(self):
        session = super().session_info()
        session["web_x2many_list_scroll_rows"] = self._web_x2many_list_scroll_rows()
        return session

    def _web_x2many_list_scroll_rows(self):
        """Rows a list inside a form shows before it scrolls.

        0 leaves the lists as they are.
        """
        value = self.env["ir.config_parameter"].sudo().get_param(PARAM_ROWS, "0")
        try:
            return max(int(value), 0)
        except ValueError:
            return 0

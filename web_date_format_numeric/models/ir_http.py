# Copyright 2026 Camptocamp SA
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from odoo import models


class IrHttp(models.AbstractModel):
    _inherit = "ir.http"

    def session_info(self):
        res = super().session_info()
        lang = self.env["res.lang"]._lang_get(self.env.user.lang)
        res["use_date_format_numeric"] = lang.use_date_format_numeric if lang else True
        return res

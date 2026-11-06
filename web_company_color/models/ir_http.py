# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).
from odoo import models


class IrHttp(models.AbstractModel):
    _inherit = "ir.http"

    def webclient_rendering_context(self):
        res = super().webclient_rendering_context()
        company = self.env["res.company"]._get_web_company_color_active_company()
        res["web_company_color_theme_color"] = company._get_theme_color()
        return res

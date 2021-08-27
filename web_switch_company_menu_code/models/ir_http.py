# Copyright 2021 Akretion
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

from odoo import models
from odoo.http import request


class Http(models.AbstractModel):
    _inherit = "ir.http"

    def session_info(self):
        result = super().session_info()
        allowed_companies = result["user_companies"]["allowed_companies"]
        allowed_companies_with_code = []
        for company in allowed_companies:
            code = request.env["res.company"].browse(company[0]).code
            formatted_code = "[{}] ".format(code) if code else ""
            allowed_companies_with_code.append((company[0], company[1], formatted_code))
        result["user_companies"]["allowed_companies"] = allowed_companies_with_code
        return result

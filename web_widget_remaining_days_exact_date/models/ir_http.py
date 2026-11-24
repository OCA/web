# Part of Odoo. See LICENSE file for full copyright and licensing details.

from odoo import models


class IrHttp(models.AbstractModel):
    _inherit = "ir.http"

    def session_info(self):
        res = super().session_info()
        res["disable_remaining_days_rule"] = self.env[
            "disable.remaining.days.rule"
        ].get_all_rules()
        return res

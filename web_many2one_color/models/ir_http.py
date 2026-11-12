# Copyright 2026 glueckkanja AG
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

from odoo import models


class IrHttp(models.AbstractModel):
    _inherit = "ir.http"

    def session_info(self):
        session_info = super().session_info()
        session_info["many2one_color_models"] = self.env[
            "many2one.color.mixin"
        ]._get_many2one_color_models()
        return session_info

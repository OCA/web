# Copyright 2026 ForgeFlow S.L. (https://www.forgeflow.com)
# License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl.html).
from odoo import models

DEFAULT_BLOCK_DELAY = "3000"


class IrHttp(models.AbstractModel):
    _inherit = "ir.http"

    def session_info(self):
        session_info = super().session_info()
        session_info["web_loading_block_ui_delay"] = (
            self.env["ir.config_parameter"]
            .sudo()
            .get_param("web_loading_block_ui.delay", DEFAULT_BLOCK_DELAY)
        )
        return session_info

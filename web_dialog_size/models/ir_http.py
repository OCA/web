# Copyright 2023 Camptocamp
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

from odoo import models


class Http(models.AbstractModel):
    _inherit = "ir.http"

    def session_info(self):
        IrConfigSudo = self.env["ir.config_parameter"].sudo()
        session_info = super().session_info()
        session_info.update(IrConfigSudo.get_web_dialog_size_config())
        return session_info

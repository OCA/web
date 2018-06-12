# Copyright 2018 Tecnativa - Jairo Llopis
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

from odoo.models import Model
from odoo.tools.safe_eval import const_eval


class IrConfigParameter(Model):
    _inherit = "ir.config_parameter"

    def get_web_dialog_size_config(self):
        return {
            key: const_eval(
                self.sudo().get_param("web_dialog_size.%s" % key),
                "False")
            for key in ["default_maximize"]
        }

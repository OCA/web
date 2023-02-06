# Copyright 2023 Sunflower IT
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

from odoo import _, api, models
from odoo.exceptions import AccessError, UserError


class ResCompany(models.Model):
    _inherit = "res.company"

    @api.model
    def get_ir_config_param_data(self, key):
        if not self.env.user.has_group("base.group_user"):
            raise AccessError(
                _(
                    "You are not allowed to access this "
                    "functionality, please contact Admin for "
                    "more support"
                )
            )
        try:
            self.env.cr.execute(
                "select value from ir_config_parameter where " "key=(%s);", (key,)
            )
            res = self.env.cr.fetchone()
        except Exception as e:
            raise UserError(_("Error: %s" % e))
        else:
            if res:
                return "%s" % res
            return ""

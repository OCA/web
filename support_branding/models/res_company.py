# Copyright 2023 Sunflower IT
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

from odoo import _, api, models
from odoo.exceptions import AccessError


class ResCompany(models.Model):
    _inherit = "res.company"

    @api.model
    def get_support_branding_config_param_data(self):
        if not self.env.user.has_group("base.group_user"):
            raise AccessError(
                _(
                    "You are not allowed to access this "
                    "functionality, please contact Admin for "
                    "more support"
                )
            )
        self.env.cr.execute(
            "select key, value from ir_config_parameter where key ilike "
            "'support_%';"
        )
        res = self.env.cr.dictfetchall()
        if any(res):
            support_vals = {x["key"]: x["value"] for x in res}
            return support_vals

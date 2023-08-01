# Copyright 2023 ACSONE SA/NV
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

from odoo import fields, models

TOOLTIP_MANAGER_GROUP = "web_field_tooltip.group_tooltip_manager"


class ResUsers(models.Model):
    _inherit = "res.users"

    tooltip_show_add_helper = fields.Boolean(
        string="Show helper to add tooltips on fields",
    )
    tooltip_show_add_helper_allowed = fields.Boolean(
        compute="_compute_tooltip_show_add_helper_allowed"
    )

    def __init__(self, pool, cr):
        super().__init__(pool, cr)
        field_names = ["tooltip_show_add_helper"]
        self.SELF_READABLE_FIELDS.extend(field_names)
        self.SELF_WRITEABLE_FIELDS.extend(field_names)

    def _compute_tooltip_show_add_helper_allowed(self):
        for rec in self:
            rec.tooltip_show_add_helper_allowed = rec._is_tooltip_manager()

    def _is_tooltip_manager(self):
        self.ensure_one()
        return self.has_group(TOOLTIP_MANAGER_GROUP)

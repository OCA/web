# Copyright 2022 ACSONE SA/NV
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

from odoo import _, models


class WebDashboardMixin(models.AbstractModel):
    _name = "web.dashboard.mixin"
    _description = "Web Dashboard Mixin"

    def action_show_dashboard(self):
        self.ensure_one()
        context = {
            "dashboard_model_active_ids": self.ids,
            "dashboard_model_active_id": self.ids[0],
            "search_default_group_by_category": True,
        }
        context.update(self.env.context)
        return {
            "name": _("Dashboard"),
            "type": "ir.actions.act_window",
            "res_model": "web.dashboard",
            "domain": [("res_model", "=", self._name)],
            "view_mode": "kanban",
            "context": context,
        }

# Copyright 2022 ACSONE SA/NV
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

from odoo import fields, models


class WebDashboard(models.Model):

    _name = "web.dashboard"
    _description = "Web Dashboard"
    _inherit = "web.dashboard.action.mixin"

    category = fields.Char()
    action_ids = fields.One2many(
        comodel_name="web.dashboard.action",
        inverse_name="dashboard_id",
        string="Actions",
    )
    color = fields.Integer("Color Index", default=0)
    user_id = fields.Many2one(comodel_name="res.users", string="User")
    model_id = fields.Many2one(comodel_name="ir.model", string="Model")
    res_model = fields.Char(
        readonly=True, related="model_id.model", store=True, string="Model _name"
    )

    def open_action(self):
        self.ensure_one()
        dashboard_action_id = self.env.context.get("dashboard_action_id")
        if not dashboard_action_id:
            dashboard_action = self
        else:
            dashboard_action = self.env["web.dashboard.action"].browse(
                dashboard_action_id
            )
        return dashboard_action._get_dashboard_action()

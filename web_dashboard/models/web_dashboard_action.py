# Copyright 2022 ACSONE SA/NV
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

from odoo import fields, models


class WebDashboardAction(models.Model):

    _name = "web.dashboard.action"
    _description = "Web Dashboard Action"
    _inherit = "web.dashboard.action.mixin"

    dashboard_id = fields.Many2one(
        comodel_name="web.dashboard", required=True, ondelete="cascade"
    )

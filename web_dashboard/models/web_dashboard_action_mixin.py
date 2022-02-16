# Copyright 2022 ACSONE SA/NV
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

from odoo import api, fields, models
from odoo.tools import safe_eval


class WebDashboardAction(models.AbstractModel):

    _name = "web.dashboard.action.mixin"
    _description = "Web Dashboard Action Mixin"
    _order = "sequence, id"

    name = fields.Char(required="Label")
    sequence = fields.Integer(default=10)
    act_window_id = fields.Many2one(
        comodel_name="ir.actions.act_window",
        required=True,
        ondelete="cascade",
        string="Action",
    )
    action_xml_id = fields.Integer(
        related="act_window_id.id", readonly=True, store=True, string="Action ID"
    )
    specific_model_action = fields.Char()
    related_records_count = fields.Integer(
        compute="_compute_related_records_count", compute_sudo=True
    )
    visibility = fields.Integer(compute="_compute_visibility")

    @api.depends("action_xml_id")
    def _compute_visibility(self):
        user_groups = self.env.user.groups_id
        for rec in self:
            if not rec.act_window_id:
                rec.visibility = True
            model = rec.act_window_id.res_model
            user_has_access_to_groups = not rec.act_window_id.groups_id or any(
                [group in user_groups for group in rec.act_window_id.groups_id]
            )
            has_access_to_model = self.env[model].check_access_rights(
                "read", raise_exception=False
            )
            rec.visibility = user_has_access_to_groups and has_access_to_model

    @api.depends("action_xml_id")
    def _compute_related_records_count(self):
        context = {
            "dashboard_model_active_ids": self.env.context.get("active_ids"),
            "dashboard_model_active_id": self.env.context.get("active_id"),
        }
        for rec in self:
            if not rec.act_window_id or rec.specific_model_action:
                rec.related_records_count = 0
            else:
                domain = rec.act_window_id.domain
                model = rec.act_window_id.res_model
                domain = safe_eval(domain, ctx=context) if domain else []
                rec.related_records_count = self.env[model].search_count(domain)

    def _get_dashboard_action(self):
        if (
            not self.specific_model_action
            or not self.env.context.get("active_model")
            or not self.env.context.get("active_ids")
        ):
            return self.act_window_id.read()[0] if self.act_window_id else {}
        records = self.env[self.env.context.get("active_model")].browse(
            self.env.context.get("active_ids")
        )

        return (
            getattr(records, self.specific_model_action)()
            if hasattr(records, self.specific_model_action)
            else {}
        )

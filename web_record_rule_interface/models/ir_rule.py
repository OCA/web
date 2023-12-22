# Copyright 2024 Ooops404
# License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl).
from odoo import api, fields, models
from odoo.tools.safe_eval import safe_eval


class IrRule(models.Model):
    _inherit = "ir.rule"

    model_name = fields.Char(compute="_compute_model_name", store=True)
    domain = fields.Char()
    original_domain = fields.Char(readonly=True)
    custom_rule_type = fields.Selection(
        [("readonly", "Readonly"), ("invisible", "Invisible")]
    )

    @api.depends("model_id")
    def _compute_model_name(self):
        for rec in self:
            rec.model_name = rec.model_id.model

    @api.onchange("domain")
    def onchange_domain(self):
        if self.domain:
            self.domain_force = str([tuple(r) for r in safe_eval(self.domain)])

    @api.model_create_multi
    def create(self, vals_list):
        for vals in vals_list:
            vals["original_domain"] = vals.get("domain_force")
        return super(IrRule, self).create(vals_list)

    def action_restore_original_domain(self):
        for rec in self:
            rec.domain_force = rec.original_domain

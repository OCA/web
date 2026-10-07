# Part of Odoo. See LICENSE file for full copyright and licensing details.

from odoo import fields, models


class DisableRemainingDaysRuleWizard(models.TransientModel):
    _name = "disable.remaining.days.rule.wizard"
    _description = "Disable Remaining Days Rule Wizard"

    def action_define_remaining_days_rule_by_view_type(self):
        """
        Action to define remaining days rule by view type
        """
        self.ensure_one()
        # Delete all lines
        diseable_view_types_json = {}
        for line in self.line_ids.filtered(lambda line: line.selected):
            diseable_view_types_json[line.technical_name] = line.name
        self.disable_remaining_days_rule_id.diseable_view_types_json = str(
            diseable_view_types_json
        )
        return {"type": "ir.actions.act_window_close"}

    disable_remaining_days_rule_id = fields.Many2one(
        "disable.remaining.days.rule",
        string="Disable Remaining Days Rule",
        help="Link to the disable remaining days rule.",
        required=True,
    )

    line_ids = fields.One2many(
        "disable.remaining.days.rule.line.wizard",
        "disable_remaining_days_rule_wizard_id",
        string="Rules",
        help="List of view types where the remaining days widget can be disabled.",
    )

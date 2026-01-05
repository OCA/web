# Part of Odoo. See LICENSE file for full copyright and licensing details.

from odoo import fields, models


class DisableRemainingDaysRuleLineWizard(models.TransientModel):
    _name = "disable.remaining.days.rule.line.wizard"
    _description = "Disable Remaining Days Rule Line Wizard"

    disable_remaining_days_rule_wizard_id = fields.Many2one(
        "disable.remaining.days.rule.wizard",
        string="Wizard",
        required=True,
        ondelete="cascade",
        help="Link to the disable remaining days rule wizard.",
    )
    name = fields.Char(
        string="Model",
        required=True,
        readonly=True,
        help="Name of the view type where the remaining days widget will be disabled.",
    )
    technical_name = fields.Char(
        string="Technical Name of view type",
        required=True,
        readonly=True,
        help="Technical name of the view type where the remaining days widget"
        " will be disabled.",
    )
    selected = fields.Boolean(
        string="Selected record",
    )

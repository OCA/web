from odoo import fields, models


class ResConfigSettings(models.TransientModel):
    _inherit = "res.config.settings"

    disable_remaining_days = fields.Boolean(
        related="company_id.disable_remaining_days",
        string="Disable Remaining Days",
        help="If active, the remaining days widget will be disabled for all models.",
        readonly=False,
        groups="base.group_system",
    )

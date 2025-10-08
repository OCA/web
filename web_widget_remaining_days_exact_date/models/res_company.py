from odoo import fields, models


class ResCompany(models.Model):
    _inherit = "res.company"

    disable_remaining_days = fields.Boolean(
        string="Disable Remaining Days Widget",
        company_dependent=True,
        default=True,
        groups="base.group_system",
        help="If active, the remaining days widget will be disabled for all models.",
    )

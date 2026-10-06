from odoo import fields, models


class ResUsers(models.Model):
    _inherit = "res.users"

    default_company_ids = fields.Many2many(
        "res.company",
        "res_users_default_company_rel",
        "user_id",
        "company_id",
        string="Default Companies",
        help="Companies selected by default when user logs in",
    )

    @property
    def SELF_READABLE_FIELDS(self):
        return super().SELF_READABLE_FIELDS + ["default_company_ids"]

    @property
    def SELF_WRITEABLE_FIELDS(self):
        return super().SELF_WRITEABLE_FIELDS + ["default_company_ids"]

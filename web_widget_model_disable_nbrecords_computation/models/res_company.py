from odoo import fields, models


class ResCompany(models.Model):
    _inherit = "res.company"

    field_domain_widget_default_auto_fetch_nbrecords = fields.Boolean(
        string="Fetch number of records on domain fields widget",
        required=True,
        default=True,
    )

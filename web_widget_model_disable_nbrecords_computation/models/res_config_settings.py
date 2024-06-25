from odoo import fields, models


class ResConfigSettings(models.TransientModel):
    _inherit = "res.config.settings"

    field_domain_widget_default_auto_fetch_nbrecords = fields.Boolean(
        string="Fetch number of records on domain fields widget",
        required=False,
        related="company_id.field_domain_widget_default_auto_fetch_nbrecords",
        readonly=False,
        config_parameter="web_widget_model_disable_nbrecords_computation."
        "field_domain_widget_default_auto_fetch_nbrecords",
    )

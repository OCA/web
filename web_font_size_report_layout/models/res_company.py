from odoo import api, fields, models


class ResCompany(models.Model):
    _inherit = "res.company"

    report_font_size = fields.Selection(
        selection=[
            ("9", "9 pt"),
            ("10", "10 pt"),
            ("11", "11 pt"),
            ("12", "12 pt"),
            ("13", "13 pt"),
            ("14", "14 pt"),
        ],
        string="Report font size",
        default="11",
        help="Base font size for PDF content (in points), applied on the external "
        "report layout.",
    )

    @api.model_create_multi
    def create(self, vals_list):
        companies = super().create(vals_list)
        style_fields = {
            "external_report_layout_id",
            "font",
            "report_font_size",
            "primary_color",
            "secondary_color",
        }
        if any(not style_fields.isdisjoint(values) for values in vals_list):
            self._update_asset_style()
        return companies

    def write(self, values):
        res = super().write(values)
        style_fields = {
            "external_report_layout_id",
            "font",
            "report_font_size",
            "primary_color",
            "secondary_color",
        }
        if not style_fields.isdisjoint(values):
            self._update_asset_style()
        return res

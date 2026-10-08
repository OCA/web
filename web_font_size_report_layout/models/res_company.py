# Copyright 2025 Binhex
# License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl).
from odoo import api, fields, models

STYLE_FIELDS = {
    "external_report_layout_id",
    "font",
    "report_font_size",
    "primary_color",
    "secondary_color",
}


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
        if any(not STYLE_FIELDS.isdisjoint(values) for values in vals_list):
            self._update_asset_style()
        return companies

    def write(self, values):
        res = super().write(values)
        if not STYLE_FIELDS.isdisjoint(values):
            self._update_asset_style()
        return res

from odoo import api, fields, models


class BaseDocumentLayout(models.TransientModel):
    _inherit = "base.document.layout"

    report_font_size = fields.Selection(
        related="company_id.report_font_size",
        readonly=False,
        string="Font size",
    )

    @api.onchange("report_font_size")
    def _onchange_report_font_size(self):
        if hasattr(self, "_compute_preview"):
            try:
                self._compute_preview()
            except Exception:
                self.preview = False

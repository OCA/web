# web_font_size_report_layout/models/base_document_layout.py
import logging

from odoo import api, fields, models

_logger = logging.getLogger(__name__)


class BaseDocumentLayout(models.TransientModel):
    _inherit = "base.document.layout"

    report_font_size = fields.Selection(
        related="company_id.report_font_size",
        readonly=False,
        string="Font size",
    )

    @api.onchange("report_font_size")
    def _onchange_report_font_size(self):
        func = getattr(self, "_compute_preview", None)
        if not callable(func):
            return
        try:
            func()
        except Exception as exc:  # pylint: disable=broad-except
            _logger.debug("Failed computing document layout preview: %s", exc)
            self.preview = False

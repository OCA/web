# Copyright 2025 Binhex
# License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl).
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

    @api.depends("report_font_size")
    def _compute_preview(self):
        return super()._compute_preview()

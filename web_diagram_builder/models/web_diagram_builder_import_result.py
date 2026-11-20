# Copyright 2024 TechnoLibre
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

from odoo import api, fields, models


class WebDiagramBuilderImportResultLine(models.TransientModel):
    _name = "web.diagram.builder.import.result.line"
    _description = "Import Result Line"

    result_id = fields.Many2one("web.diagram.builder.import.result", ondelete="cascade")
    file_name = fields.Char(string="File")
    status = fields.Selection(
        [("success", "Success"), ("error", "Error")],
        string="Status",
    )
    builder_id = fields.Many2one("web.diagram.builder", string="Diagram Created")
    error_message = fields.Text(string="Error")


class WebDiagramBuilderImportResult(models.TransientModel):
    _name = "web.diagram.builder.import.result"
    _description = "Import Result"

    line_ids = fields.One2many(
        "web.diagram.builder.import.result.line",
        "result_id",
        string="Results",
    )

    def action_download_report(self):
        self.ensure_one()
        return {
            "type": "ir.actions.act_window",
            "res_model": "web.diagram.builder.import.report",
            "views": [(False, "form")],
            "target": "new",
            "context": {"default_result_id": self.id},
        }

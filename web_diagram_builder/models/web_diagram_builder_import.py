# Copyright 2024 TechnoLibre
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

import base64
import csv
import io

from odoo import _, fields, models
from odoo.exceptions import UserError
from odoo.tools.safe_eval import safe_eval

KNOWN_KEYS = {
    "name",
    "description",
    "model_name",
    "recursive_field_name",
    "filter_domain",
    "max_nodes",
}


class WebDiagramBuilderImport(models.TransientModel):
    _name = "web.diagram.builder.import"
    _description = "Import Diagram Builder from CSV"

    file_ids = fields.Many2many(
        "ir.attachment",
        string="CSV Files",
        help="Select one or more CSV files exported from Diagram Builder.",
    )

    def _parse_config(self, raw):
        """Parse a CSV file and return the config dict, or raise UserError."""
        reader = csv.reader(io.StringIO(raw))
        config = {}
        in_config = False
        for row in reader:
            if not row:
                continue
            cell = row[0].strip()
            if cell == "# DIAGRAM BUILDER CONFIG":
                in_config = True
                continue
            if cell.startswith("#"):
                break
            if in_config and len(row) >= 2:
                config[cell] = row[1].strip()

        required = ["name", "model_name", "recursive_field_name"]
        missing = [k for k in required if not config.get(k)]
        if missing:
            raise UserError(
                _("Missing fields: %s.") % ", ".join(missing)
            )

        unknown = [k for k in config if k not in KNOWN_KEYS]
        if unknown:
            raise UserError(
                _("Unknown fields in file: %s.") % ", ".join(unknown)
            )

        filter_domain = config.get("filter_domain", "[]")
        try:
            parsed = safe_eval(filter_domain)
            if not isinstance(parsed, list):
                raise ValueError()
        except (ValueError, SyntaxError):
            raise UserError(
                _("Invalid filter_domain: must be a valid Odoo domain list.")
            )

        max_nodes = config.get("max_nodes", "200")
        try:
            int(max_nodes)
        except ValueError:
            raise UserError(
                _("Invalid max_nodes: must be an integer.")
            )

        return config

    def _import_one(self, config):
        """Create and compute one builder from a parsed config dict."""
        ir_model = self.env["ir.model"].search(
            [("model", "=", config["model_name"])], limit=1
        )
        if not ir_model:
            raise UserError(
                _("Model '%s' not found in this database.") % config["model_name"]
            )

        ir_field = self.env["ir.model.fields"].search(
            [
                ("model_id", "=", ir_model.id),
                ("name", "=", config["recursive_field_name"]),
            ],
            limit=1,
        )
        if not ir_field:
            raise UserError(
                _("Field '%s' not found on model '%s'.")
                % (config["recursive_field_name"], config["model_name"])
            )

        builder = self.env["web.diagram.builder"].create({
            "name": config.get("name"),
            "description": config.get("description", ""),
            "model_id": ir_model.id,
            "recursive_field_id": ir_field.id,
            "filter_domain": config.get("filter_domain", "[]"),
            "max_nodes": int(config.get("max_nodes") or 200),
        })
        builder.action_compute()
        return builder

    def action_import(self):
        if not self.file_ids:
            raise UserError(_("Please upload at least one CSV file."))

        lines = []

        for attachment in self.file_ids:
            try:
                raw = base64.b64decode(attachment.datas).decode("utf-8")
                config = self._parse_config(raw)
                builder = self._import_one(config)
                lines.append({
                    "file_name": attachment.name,
                    "status": "success",
                    "builder_id": builder.id,
                })
            except UserError as e:
                lines.append({
                    "file_name": attachment.name,
                    "status": "error",
                    "error_message": str(e.args[0]),
                })
            except Exception as e:
                lines.append({
                    "file_name": attachment.name,
                    "status": "error",
                    "error_message": _("Unexpected error: %s") % str(e),
                })

        result = self.env["web.diagram.builder.import.result"].create({
            "line_ids": [(0, 0, line) for line in lines],
        })
        return {
            "type": "ir.actions.act_window",
            "res_model": "web.diagram.builder.import.result",
            "res_id": result.id,
            "view_mode": "form",
            "target": "new",
        }

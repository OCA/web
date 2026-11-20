# Copyright 2023 Kencove (https://kencove.com).
# @author Mohamed Alkobrosli <malkobrosly@kencove.com>
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

import json
import logging

from odoo import models
from odoo.tools.translate import _

from odoo.addons.base_import.models.base_import import (
    EXTENSIONS,
    FILE_TYPE_DICT,
    ImportValidationError,
)

_logger = logging.getLogger(__name__)

FILE_TYPE_DICT.update(
    {
        "application/json": ("json", True, None),
        "text/json": ("json", True, None),
    }
)
EXTENSIONS[".json"] = "json"


class CustomImport(models.TransientModel):
    _inherit = "base_import.import"

    def _read_json(self, options):
        """Parses a JSON file where the root is a list of flat dictionaries (records).

        :param dict options: Import options (currently unused)
        :returns: (number of records, data rows)
        :rtype: (int, list[list])
        """
        self.ensure_one()
        json_bytes = self.file or b""
        if not json_bytes:
            return (0, [])
        try:
            # Decode file (assume utf-8, or use chardet if needed)
            json_str = json_bytes.decode("utf-8")
            parsed = json.loads(json_str)
            if not isinstance(parsed, list):
                raise ImportValidationError(
                    _("Top-level JSON structure must be a list of objects.")
                )
            # Ensure all items are dicts
            if not all(isinstance(rec, dict) for rec in parsed):
                raise ImportValidationError(
                    _("Each record in the JSON list must be an object (dictionary).")
                )
            # Collect all unique keys
            all_keys = sorted(set().union(*(rec.keys() for rec in parsed)))
            # Build the row data for the import preview
            content = [[f'{rec.get(key, "")}' for key in all_keys] for rec in parsed]
            return len(content), [all_keys] + content
        except json.JSONDecodeError as e:
            raise ImportValidationError(_("Invalid JSON file: %s") % str(e)) from e

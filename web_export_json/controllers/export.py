# Copyright 2023 Kencove (https://kencove.com).
# @author Mohamed Alkobrosli <malkobrosly@kencove.com>
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

import json
import logging

from odoo import http
from odoo.exceptions import UserError
from odoo.tools.translate import _

from odoo.addons.web.controllers.export import Export, ExportFormat

_logger = logging.getLogger(__name__)


class CustomExport(Export):
    def formats(self):
        result = super().formats()
        result.append({"tag": "json", "label": "JSON", "error": None})
        return result


class JSONExport(ExportFormat, http.Controller):
    @http.route("/web/export/json", type="http", auth="user")
    def index(self, data):
        """
        data example:
        {
            "import_compat":false,
            "context":{
                "params":{},
                "lang":"en_US",
                "tz":"Africa/Nairobi",
                "uid":2,
                "allowed_company_ids":[1]
            },
            "domain":[["sale_ok","=",true]],
            "fields":[
                {
                    "name":"activity_exception_decoration",
                    "label":"Activity Exception Decoration",
                    "type":"selection"
                }
            ],
            "groupby":[],
            "ids":[23],
            "model":"product.template"
        }
        """
        try:
            result = self.base(data)
            return result
        except Exception as exc:
            _logger.exception("Exception during JSON export.")
            payload = json.dumps(
                {
                    "code": 200,
                    "message": "Odoo Server Error",
                    "data": http.serialize_exception(exc),
                }
            )
            raise http.InternalServerError(payload) from exc

    @property
    def content_type(self):
        return "application/json;charset=utf-8"

    @property
    def extension(self):
        return ".json"

    def from_group_data(self, fields, groups):
        raise UserError(_("Exporting grouped data to JSON is not supported."))

    def from_data(self, fields, rows):
        # Create list of dicts with field:value pairs
        json_data = [dict(zip(fields, row)) for row in rows]
        return json.dumps(json_data, indent=4).encode("utf-8")

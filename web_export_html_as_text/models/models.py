# Copyright 2025 Quartile (https://www.quartile.co)
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

from odoo import api, models
from odoo.models import fix_import_export_id_paths
from odoo.tools import html2plaintext


def _is_html_path(model, path):
    if not path or path[0] in ("id", ".id"):
        return False
    cur_model = model
    for i, p in enumerate(path):
        fld = cur_model._fields.get(p)
        if not fld:
            return False
        last = i == len(path) - 1
        if last:
            return getattr(fld, "type", None) == "html"
        if getattr(fld, "relational", False):
            cur_model = model.env[fld.comodel_name]
        else:
            return False
    return False


class BaseExportHtmlAsText(models.AbstractModel):
    _inherit = "base"

    @api.model
    def export_data(self, fields_to_export):
        res = super().export_data(fields_to_export)
        if not self.env.context.get("export_html_as_text"):
            return res
        datas = res.get("datas", [])
        if not datas:
            return res
        fields_to_export = [fix_import_export_id_paths(f) for f in fields_to_export]
        html_indexes = [
            i for i, p in enumerate(fields_to_export) if _is_html_path(self, p)
        ]
        if not html_indexes:
            return res
        for row in datas:
            for idx in html_indexes:
                if isinstance(row[idx], str) and row[idx]:
                    row[idx] = html2plaintext(row[idx])
        return res

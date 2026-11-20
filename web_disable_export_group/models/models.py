# Copyright 2023 Tecnativa - David Vidal
# License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl).
from odoo import models


class Base(models.AbstractModel):
    _inherit = "base"

    def export_data(self, fields_to_export):
        """Export fields for selected objects

        :param fields_to_export: list of fields
        :param raw_data: True to return value in native Python type
        :rtype: dictionary with a *datas* matrix

        This method is used when exporting data via client menu
        """
        if self.env.user.has_group("web_disable_export_group.group_export_xlsx_data"):
            fields_to_export = [
                models.fix_import_export_id_paths(f) for f in fields_to_export
            ]
            return {"datas": self._export_rows(fields_to_export)}
        return super().export_data(fields_to_export)

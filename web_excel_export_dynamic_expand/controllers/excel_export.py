# Copyright 2024-26 ForgeFlow S.L.
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

import json
from collections import OrderedDict

from odoo import http

from odoo.addons.web.controllers.export import ExcelExport


class CustomGroupsTreeNode(ExcelExport):
    @http.route("/web/export/xlsx", type="http", auth="user")
    def web_export_xlsx(self, data):
        params = json.loads(data)
        self.context = params.get("context", {})
        response = super().web_export_xlsx(data)
        return response

    @property
    def context(self):
        return self._context

    @context.setter
    def context(self, value):
        self._context = value

    def _strip_beyond_depth(self, node, current_depth, max_depth):
        if current_depth >= max_depth:
            aggregated_values = node.aggregated_values
            node.children = OrderedDict()
            node.data = []
            node.aggregated_values = aggregated_values
        else:
            for child_node in node.children.values():
                self._strip_beyond_depth(child_node, current_depth + 1, max_depth)

    def from_group_data(self, fields, columns_headers, groups):
        expand_depth = self.context.get("expand_depth")
        if expand_depth is not None:
            for child_node in groups.children.values():
                self._strip_beyond_depth(child_node, 0, expand_depth)
        return super().from_group_data(fields, columns_headers, groups)

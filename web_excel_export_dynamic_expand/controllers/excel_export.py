# Copyright 2024 ForgeFlow S.L.
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

import json
from collections import OrderedDict

from odoo import http

from odoo.addons.web.controllers.main import ExcelExport


class CustomGroupsTreeNode(ExcelExport):
    @http.route("/web/export/xlsx", type="http", auth="user")
    def index(self, data):
        params = json.loads(data)
        self.context = params.get("context", {})
        response = super().index(data)
        return response

    @property
    def context(self):
        return self._context

    @context.setter
    def context(self, value):
        self._context = value

    def from_group_data(self, fields, groups):
        collapse_groups = self.context.get("collapse_groups")
        if collapse_groups:
            for _child_key, child_node in groups.children.items():
                aggregated_values = child_node.aggregated_values
                if child_node.children:
                    child_node.children = OrderedDict()
                if child_node.data:
                    child_node.data = []
                child_node.aggregated_values = aggregated_values
        return super().from_group_data(fields, groups)

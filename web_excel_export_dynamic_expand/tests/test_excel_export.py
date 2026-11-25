# Copyright 2024-26 ForgeFlow S.L.
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

import json
from collections import OrderedDict
from unittest.mock import patch

from odoo.tests.common import TransactionCase

from odoo.addons.web_excel_export_dynamic_expand.controllers.excel_export import (
    CustomGroupsTreeNode,
)


class MockGroupNode:
    def __init__(self, children=None, data=None, aggregated_values=None):
        self.children = OrderedDict(children) if children else OrderedDict()
        self.data = data or []
        self.aggregated_values = aggregated_values or {}


class TestExcelExportDynamicExpand(TransactionCase):
    def setUp(self):
        super().setUp()
        self.controller = CustomGroupsTreeNode()

    @patch("odoo.addons.web.controllers.export.ExcelExport.web_export_xlsx")
    def test_web_export_xlsx_context(self, mock_super_export):
        mock_super_export.return_value = "dummy_response"
        data = json.dumps({"context": {"expand_depth": 0}})

        response = self.controller.web_export_xlsx(data)

        if hasattr(response, "data"):
            self.assertEqual(response.data, b"dummy_response")
        else:
            self.assertEqual(response, "dummy_response")

        self.assertEqual(self.controller.context.get("expand_depth"), 0)
        mock_super_export.assert_called_once_with(data)

    @patch("odoo.addons.web.controllers.export.ExcelExport.from_group_data")
    def test_from_group_data_collapse(self, mock_super_from_group_data):
        self.controller.context = {"expand_depth": 0}

        child1 = MockGroupNode(
            data=[1, 2],
            aggregated_values={"val": 10},
            children={"sub": MockGroupNode()},
        )
        groups = MockGroupNode(children={"child1": child1})

        self.controller.from_group_data([], [], groups)

        self.assertEqual(child1.children, OrderedDict())
        self.assertEqual(child1.data, [])
        self.assertEqual(child1.aggregated_values, {"val": 10})
        mock_super_from_group_data.assert_called_once()

    @patch("odoo.addons.web.controllers.export.ExcelExport.from_group_data")
    def test_from_group_data_expand_depth_1(self, mock_super_from_group_data):
        self.controller.context = {"expand_depth": 1}

        sub_child = MockGroupNode(
            data=[3, 4],
            aggregated_values={"val": 5},
            children={"sub_sub": MockGroupNode()},
        )
        child1 = MockGroupNode(
            data=[1, 2],
            aggregated_values={"val": 10},
            children={"sub": sub_child},
        )
        groups = MockGroupNode(children={"child1": child1})

        self.controller.from_group_data([], [], groups)

        self.assertEqual(len(child1.children), 1)
        self.assertEqual(child1.data, [1, 2])
        self.assertEqual(child1.aggregated_values, {"val": 10})

        self.assertEqual(sub_child.children, OrderedDict())
        self.assertEqual(sub_child.data, [])
        self.assertEqual(sub_child.aggregated_values, {"val": 5})
        mock_super_from_group_data.assert_called_once()

    @patch("odoo.addons.web.controllers.export.ExcelExport.from_group_data")
    def test_from_group_data_no_expand_depth(self, mock_super_from_group_data):
        self.controller.context = {}

        child1 = MockGroupNode(
            data=[1, 2],
            aggregated_values={"val": 10},
            children={"sub": MockGroupNode()},
        )
        groups = MockGroupNode(children={"child1": child1})

        self.controller.from_group_data([], [], groups)

        self.assertEqual(len(child1.children), 1)
        self.assertEqual(child1.data, [1, 2])
        self.assertEqual(child1.aggregated_values, {"val": 10})
        mock_super_from_group_data.assert_called_once()

    def test_context_property(self):
        self.controller.context = {"test": 1}
        self.assertEqual(self.controller.context, {"test": 1})

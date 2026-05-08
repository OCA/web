# Part of Odoo. See LICENSE file for full copyright and licensing details.

from lxml import etree

from odoo.tests.common import TransactionCase


class TestDiagramViewValidation(TransactionCase):

    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.model = cls.env["ir.model"].search(
            [("model", "=", "res.partner")], limit=1
        )
        cls.field_parent = cls.env["ir.model.fields"].search(
            [("model_id", "=", cls.model.id), ("name", "=", "parent_id")],
            limit=1,
        )

    def _skip_if_no_builder(self):
        if "web.diagram.builder" not in self.env:
            self.skipTest("web_diagram_builder is not installed")

    def _make_builder(self, domain=None):
        """Create a minimal builder with a parent/child res.partner hierarchy."""
        parent = self.env["res.partner"].create(
            {"name": "TestParent", "is_company": True}
        )
        child = self.env["res.partner"].create(
            {"name": "TestChild", "parent_id": parent.id}
        )
        if domain is None:
            domain = f"[('id', 'in', [{parent.id}, {child.id}])]"
        builder = self.env["web.diagram.builder"].create(
            {
                "name": "Test graph_get",
                "model_id": self.model.id,
                "recursive_field_id": self.field_parent.id,
                "filter_domain": domain,
            }
        )
        builder.action_compute()
        return builder, parent, child

    def test_validate_tag_label_in_diagram_skips_for_check(self):
        """<label> inside a <diagram> must not raise even without 'for' attr.

        In Odoo 15, form labels require a 'for' attribute. Diagram <label>
        elements are legend/caption nodes — our override walks up the XML tree
        and skips the check when inside a <diagram> ancestor.
        """
        diagram = etree.Element("diagram")
        node_el = etree.SubElement(diagram, "node")
        label = etree.SubElement(node_el, "label")
        label.set("string", "No 'for' attribute")
        self.env["ir.ui.view"]._validate_tag_label(
            label, None, {"view_type": "diagram"}
        )

    def test_postprocess_tag_node_unknown_model_is_ignored(self):
        """An unknown model on <node> is silently skipped — no exception raised."""
        node = etree.Element("node")
        node.set("object", "model.that.does.not.exist")
        etree.SubElement(node, "field").set("name", "name")
        node_info = {
            "view_type": "diagram",
            "children": list(node),
            "editable": True,
        }
        self.env["ir.ui.view"]._postprocess_tag_node(node, None, node_info)
        self.assertEqual(node_info["children"], [])
        self.assertFalse(node_info["editable"])

    def test_postprocess_tag_arrow_unknown_model_is_ignored(self):
        """An unknown model on <arrow> is silently skipped — no exception raised."""
        node = etree.Element("arrow")
        node.set("object", "model.that.does.not.exist")
        etree.SubElement(node, "field").set("name", "name")
        node_info = {
            "view_type": "diagram",
            "children": list(node),
            "editable": True,
        }
        self.env["ir.ui.view"]._postprocess_tag_arrow(node, None, node_info)
        self.assertEqual(node_info["children"], [])
        self.assertFalse(node_info["editable"])

    def test_graph_get_basic_structure(self):
        """graph_get() returns the expected top-level keys."""
        self._skip_if_no_builder()
        builder, _, _ = self._make_builder()
        result = self.env["ir.ui.view"].graph_get(
            id=builder.id,
            model="web.diagram.builder",
            node_obj="web.diagram.builder.node",
            conn_obj="web.diagram.builder.link",
            src_node="source_node_id",
            des_node="dest_node_id",
            label="['signal']",
            scale=(140, 180),
        )
        for key in ("nodes", "transitions", "label", "blank_nodes", "node_parent_field"):
            self.assertIn(key, result)

    def test_graph_get_blank_nodes(self):
        """Isolated nodes (no connections) end up in blank_nodes."""
        self._skip_if_no_builder()
        isolate = self.env["res.partner"].create(
            {"name": "IsolateNode", "is_company": True}
        )
        builder, _, _ = self._make_builder(
            domain=f"[('id', '=', {isolate.id})]"
        )
        result = self.env["ir.ui.view"].graph_get(
            id=builder.id,
            model="web.diagram.builder",
            node_obj="web.diagram.builder.node",
            conn_obj="web.diagram.builder.link",
            src_node="source_node_id",
            des_node="dest_node_id",
            label="['signal']",
            scale=(140, 180),
        )
        blank_names = [n["name"] for n in result["blank_nodes"]]
        self.assertIn(isolate.name, blank_names)

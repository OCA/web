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
        """Create a builder with a parent/child res.partner hierarchy."""
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
        builder._compute_diagram()
        return builder, parent, child

    def test_validate_tag_label_in_diagram_skips_for_check(self):
        """<label> without 'for' must not raise in a diagram view.

        Odoo 18 requires 'for' on form labels, but diagram <label> is a
        legend element — our override skips that check.
        """
        node = etree.Element("label")
        node.set("string", "Caution: changes are saved immediately.")
        self.env["ir.ui.view"]._validate_tag_label(
            node, None, {"view_type": "diagram"}
        )

    def test_validate_tag_label_in_form_calls_super(self):
        """Outside a diagram view, our override does not short-circuit — it
        calls super() which raises because the label has no 'for' attribute.
        This confirms the diagram-only guard is working correctly.
        """
        node = etree.Element("label")
        node.set("string", "Some label")
        with self.assertRaises(ValueError):
            self.env["ir.ui.view"]._validate_tag_label(
                node, None, {"view_type": "form", "validate": True}
            )

    def test_validate_tag_node_unknown_model_is_ignored(self):
        """An unknown model on <node> is silently ignored — no exception raised."""
        node = etree.Element("node")
        node.set("object", "model.that.does.not.exist")
        etree.SubElement(node, "field").set("name", "name")
        node_info = {"view_type": "diagram", "children": [], "editable": True, "validate": True}
        self.env["ir.ui.view"]._validate_tag_node(node, None, node_info)

    def test_validate_tag_arrow_unknown_model_is_ignored(self):
        """An unknown model on <arrow> is silently ignored — no exception raised."""
        node = etree.Element("arrow")
        node.set("object", "model.that.does.not.exist")
        etree.SubElement(node, "field").set("name", "name")
        node_info = {"view_type": "diagram", "children": [], "editable": True, "validate": True}
        self.env["ir.ui.view"]._validate_tag_arrow(node, None, node_info)

    def test_graph_get_basic_structure(self):
        """graph_get() returns the expected top-level keys."""
        self._skip_if_no_builder()
        builder, _, _ = self._make_builder()
        result = self.env["ir.ui.view"].graph_get(
            rec_id=builder.id,
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

    def test_graph_get_nodes_have_coordinates(self):
        """Every node returned by graph_get() has x and y coordinates."""
        self._skip_if_no_builder()
        builder, _, _ = self._make_builder()
        result = self.env["ir.ui.view"].graph_get(
            rec_id=builder.id,
            model="web.diagram.builder",
            node_obj="web.diagram.builder.node",
            conn_obj="web.diagram.builder.link",
            src_node="source_node_id",
            des_node="dest_node_id",
            label="['signal']",
            scale=(140, 180),
        )
        for node_id, node_data in result["nodes"].items():
            self.assertIn("x", node_data)
            self.assertIn("y", node_data)

    def test_graph_get_blank_nodes(self):
        """Nodes with no connections end up in blank_nodes."""
        self._skip_if_no_builder()
        isolate = self.env["res.partner"].create(
            {"name": "Isolate", "is_company": True}
        )
        builder, _, _ = self._make_builder(
            domain=f"[('id', '=', {isolate.id})]"
        )
        result = self.env["ir.ui.view"].graph_get(
            rec_id=builder.id,
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

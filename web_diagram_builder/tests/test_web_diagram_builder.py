# Copyright 2024 TechnoLibre
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

from odoo.tests.common import TransactionCase


class TestWebDiagramBuilder(TransactionCase):

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
        cls.grandparent = cls.env["res.partner"].create(
            {"name": "Grandparent", "is_company": True}
        )
        cls.parent = cls.env["res.partner"].create(
            {"name": "Parent", "parent_id": cls.grandparent.id}
        )
        cls.child = cls.env["res.partner"].create(
            {"name": "Child", "parent_id": cls.parent.id}
        )
        cls.orphan = cls.env["res.partner"].create({"name": "Orphan"})

    def _make_builder(self, domain="[]", max_nodes=200):
        return self.env["web.diagram.builder"].create(
            {
                "name": "Test Builder",
                "model_id": self.model.id,
                "recursive_field_id": self.field_parent.id,
                "filter_domain": domain,
                "max_nodes": max_nodes,
            }
        )

    def test_compute_diagram_basic(self):
        """BFS traversal creates the right number of nodes and links."""
        builder = self._make_builder(
            domain=f"[('id', 'in', [{self.child.id}])]"
        )
        builder._compute_diagram()
        # child + parent + grandparent = 3 nodes, 2 links
        self.assertEqual(builder.node_count, 3)
        self.assertEqual(builder.link_count, 2)

    def test_compute_diagram_root_nodes(self):
        """Nodes with no parent have flow_start=True."""
        builder = self._make_builder(
            domain=f"[('id', 'in', [{self.child.id}])]"
        )
        builder._compute_diagram()
        root_nodes = builder.node_ids.filtered(lambda n: n.flow_start)
        self.assertEqual(len(root_nodes), 1)
        self.assertEqual(root_nodes.name, self.grandparent.name)

    def test_compute_diagram_max_nodes(self):
        """Traversal stops when max_nodes is reached."""
        builder = self._make_builder(
            domain=f"[('id', 'in', [{self.child.id}])]",
            max_nodes=2,
        )
        builder._compute_diagram()
        self.assertLessEqual(builder.node_count, 2)

    def test_compute_diagram_empty_domain(self):
        """An empty domain includes all reachable records."""
        builder = self._make_builder(domain="[]")
        builder._compute_diagram()
        self.assertGreaterEqual(builder.node_count, 4)

    def test_compute_diagram_with_domain(self):
        """A filtered domain includes only matching records and their ancestors."""
        builder = self._make_builder(
            domain=f"[('id', '=', {self.child.id})]"
        )
        builder._compute_diagram()
        record_ids = set(builder.node_ids.mapped("record_id"))
        self.assertNotIn(self.orphan.id, record_ids)
        self.assertIn(self.child.id, record_ids)
        self.assertIn(self.parent.id, record_ids)
        self.assertIn(self.grandparent.id, record_ids)

    def test_recompute_clears_old_data(self):
        """Calling _compute_diagram() twice does not duplicate nodes."""
        builder = self._make_builder(
            domain=f"[('id', 'in', [{self.child.id}])]"
        )
        builder._compute_diagram()
        count_first = builder.node_count
        builder._compute_diagram()
        self.assertEqual(builder.node_count, count_first)

    def test_compute_sets_last_computed(self):
        """last_computed is set after a successful computation."""
        builder = self._make_builder(
            domain=f"[('id', 'in', [{self.child.id}])]"
        )
        self.assertFalse(builder.last_computed)
        builder._compute_diagram()
        self.assertTrue(builder.last_computed)

    def test_compute_counts(self):
        """node_count and link_count match the actual records."""
        builder = self._make_builder(
            domain=f"[('id', 'in', [{self.child.id}])]"
        )
        builder._compute_diagram()
        self.assertEqual(builder.node_count, len(builder.node_ids))
        self.assertEqual(builder.link_count, len(builder.link_ids))

    def test_action_compute_returns_notification(self):
        """action_compute() returns a success notification."""
        builder = self._make_builder(
            domain=f"[('id', 'in', [{self.child.id}])]"
        )
        result = builder.action_compute()
        self.assertEqual(result["type"], "ir.actions.client")
        self.assertEqual(result["tag"], "display_notification")
        self.assertEqual(result["params"]["type"], "success")

    def test_action_open_diagram(self):
        """action_open_diagram() returns an action pointing to the diagram view."""
        builder = self._make_builder()
        result = builder.action_open_diagram()
        self.assertEqual(result["res_model"], "web.diagram.builder")
        self.assertEqual(result["res_id"], builder.id)
        self.assertIn((False, "diagram"), result["views"])

    def test_action_compute_all(self):
        """action_compute_all() runs without error across multiple builders."""
        b1 = self._make_builder(domain=f"[('id', 'in', [{self.child.id}])]")
        b2 = self._make_builder(domain=f"[('id', '=', {self.orphan.id})]")
        self.env["web.diagram.builder"].action_compute_all()
        self.assertTrue(b1.last_computed)
        self.assertTrue(b2.last_computed)

    def test_link_signal_is_field_description(self):
        """Link signal matches the recursive field's description."""
        builder = self._make_builder(
            domain=f"[('id', 'in', [{self.child.id}])]"
        )
        builder._compute_diagram()
        expected = self.field_parent.field_description
        for link in builder.link_ids:
            self.assertEqual(link.signal, expected)

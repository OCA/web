# Copyright 2025 Camptocamp SA
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

from .common import Common


class TestIrModelFields(Common):
    def test_field_can_have_options(self):
        # M2O field
        self.assertTrue(self._get_field("res.partner", "parent_id").can_have_options)
        # M2M field
        self.assertTrue(self._get_field("res.partner", "category_id").can_have_options)
        # O2M field
        self.assertFalse(self._get_field("res.partner", "user_ids").can_have_options)
        # non-relational field
        self.assertFalse(self._get_field("res.partner", "id").can_have_options)

    def test_field_comodel_id(self):
        # M2O field
        self.assertEqual(
            self._get_field("res.partner", "parent_id").comodel_id,
            self._get_model("res.partner"),
        )
        # M2M field
        self.assertEqual(
            self._get_field("res.partner", "category_id").comodel_id,
            self._get_model("res.partner.category"),
        )
        # O2M field
        self.assertEqual(
            self._get_field("res.partner", "user_ids").comodel_id,
            self._get_model("res.users"),
        )
        # Non-relational field
        self.assertFalse(self._get_field("res.partner", "id").comodel_id)

    def test_field_search(self):
        IrModelFields = self.env["ir.model.fields"]
        users_model = self.env["ir.model"]._get("res.users")
        groups_model = self.env["ir.model"]._get("res.groups")

        # Crear campo test_field en res.users
        test_field = IrModelFields.create(
            {
                "name": "x_test_field",
                "model_id": users_model.id,
                "model": "res.users",
                "field_description": "Abc",
                "ttype": "many2one",
                "relation": "res.groups",
            }
        )

        test_field_abc = IrModelFields.create(
            {
                "name": "x_test_field_abc",
                "model_id": groups_model.id,
                "model": "res.groups",
                "field_description": "Abc",
                "ttype": "many2one",
                "relation": "res.users",
            }
        )

        self.env["ir.model.fields"].flush_model()
        self.env["ir.model.fields"].invalidate_model()

        ir_model_fields = self.env["ir.model.fields"]
        name = "ABC"
        domain = [("model", "in", ("res.users", "res.groups"))]

        # String "abc" is contained in both fields' description: basic ``name_search()``
        # will return them both sorted by ID
        ir_model_fields = ir_model_fields.with_context(search_by_technical_name=False)
        self.assertEqual(
            [r[0] for r in ir_model_fields.name_search(name, domain, limit=None)],
            [test_field.id, test_field_abc.id],
        )

        # Use context key ``search_by_technical_name``: ``test_field_abc`` should now be
        # returned first
        ir_model_fields = ir_model_fields.with_context(search_by_technical_name=True)
        self.assertEqual(
            [r[0] for r in ir_model_fields.name_search(name, domain, limit=None)],
            [test_field_abc.id, test_field.id],
        )

        # Search again by mimicking the ``ir.model`` Form view for m2x options
        users_model = self.env["ir.model"]._get("res.users")
        ir_model_fields = ir_model_fields.with_context(
            o2m_list_view_m2x_domain=[("model_id", "=", users_model.id)]
        )
        self.assertEqual(
            [r[0] for r in ir_model_fields.name_search(name, domain, limit=None)],
            [test_field.id],
        )
        ir_model_fields = ir_model_fields.with_context(
            o2m_list_view_m2x_domain=[("comodel_id", "=", users_model.id)]
        )
        self.assertEqual(
            [r[0] for r in ir_model_fields.name_search(name, domain, limit=None)],
            [test_field_abc.id],
        )

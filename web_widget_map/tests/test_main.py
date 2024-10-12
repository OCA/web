from odoo.tests.common import TransactionCase


class Test(TransactionCase):
    """
    Test the Map field.
    """

    def test_map_field(self):
        """
        Test adding a Map field to a model.
        """
        view = self.env["ir.ui.view"].create(
            {
                "key": "web_widget_map.test_map",
                "type": "qweb",
                "arch": """
                <t t-name="test_map">
                    <span t-field="record.x_location" t-options-widget="'map'"/>
                </t>
            """,
            }
        )
        self.env["ir.model.fields"].create(
            {
                "model_id": self.env.ref("base.model_res_partner").id,
                "name": "x_location",
                "field_description": "Location",
                "ttype": "char",
            }
        )
        partner = self.env["res.partner"].create(
            {"name": "test partner", "x_location": "51.505, -0.09"}
        )
        html = view._render_template(view.id, {"record": partner})
        self.assertIn("51.505", html)

    def test_map_field_no_location(self):
        """
        Test adding a Map field to a model without a location.
        """
        view = self.env["ir.ui.view"].create(
            {
                "key": "web_widget_map.test_map",
                "type": "qweb",
                "arch": """
                <t t-name="test_map">
                    <span t-field="record.x_location" t-options-widget="'map'"/>
                </t>
            """,
            }
        )
        self.env["ir.model.fields"].create(
            {
                "model_id": self.env.ref("base.model_res_partner").id,
                "name": "x_location",
                "field_description": "Location",
                "ttype": "char",
            }
        )
        partner = self.env["res.partner"].create({"name": "test partner"})
        html = view._render_template(view.id, {"record": partner})
        self.assertIsInstance(html, str)

    def test_convert_to_record(self):
        """
        Test the convert_to_record method.
        """
        field = self.env["ir.model.fields"].create(
            {
                "model_id": self.env.ref("base.model_res_partner").id,
                "name": "x_location",
                "field_description": "Location",
                "ttype": "char",
            }
        )
        value = field.convert_to_record("12.34,56.78", self.env["res.partner"])
        self.assertEqual(value, "12.34,56.78")

    def test_convert_to_record_invalid(self):
        """
        Test the convert_to_record method with an invalid value.
        """
        field = self.env["ir.model.fields"].create(
            {
                "model_id": self.env.ref("base.model_res_partner").id,
                "name": "x_location",
                "field_description": "Location",
                "ttype": "char",
            }
        )
        value = field.convert_to_record("12.34,56.78,90.12", self.env["res.partner"])
        self.assertEqual(value, "0.0,0.0")

    def test_convert_to_export(self):
        """
        Test the convert_to_export method.
        """
        field = self.env["ir.model.fields"].create(
            {
                "model_id": self.env.ref("base.model_res_partner").id,
                "name": "x_location",
                "field_description": "Location",
                "ttype": "char",
            }
        )
        value = field.convert_to_export("12.34,56.78", self.env["res.partner"])
        self.assertEqual(value, "12.34,56.78")

    def test_convert_to_cache(self):
        """
        Test the convert_to_cache method.
        """
        field = self.env["ir.model.fields"].create(
            {
                "model_id": self.env.ref("base.model_res_partner").id,
                "name": "x_location",
                "field_description": "Location",
                "ttype": "char",
            }
        )
        value = field.convert_to_cache("12.34,56.78", self.env["res.partner"])
        self.assertEqual(value, "12.34,56.78")

    def test_convert_to_column(self):
        """
        Test the convert_to_column method.
        """
        field = self.env["ir.model.fields"].create(
            {
                "model_id": self.env.ref("base.model_res_partner").id,
                "name": "x_location",
                "field_description": "Location",
                "ttype": "char",
            }
        )
        value = field.convert_to_column("12.34,56.78", self.env["res.partner"])
        self.assertEqual(value, "12.34,56.78")

    def test_get_location(self):
        """
        Test the get_location method.
        """
        field = self.env["ir.model.fields"].create(
            {
                "model_id": self.env.ref("base.model_res_partner").id,
                "name": "x_location",
                "field_description": "Location",
                "ttype": "char",
            }
        )
        partner = self.env["res.partner"].create({"name": "Test"})
        partner.location = "12.34,56.78"
        value = field.get_location("x_location", "res.partner", partner.id)
        self.assertEqual(value, "12.34,56.78")

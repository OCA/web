from lxml import etree

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

# Copyright 2026 Quartile (https://www.quartile.co)
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

from odoo.tests import HttpCase, tagged


@tagged("post_install", "-at_install")
class TestPivotMonetaryFormat(HttpCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        jpy = cls.env.ref("base.JPY")
        jpy.write({"active": True, "rounding": 1})
        usd = cls.env.ref("base.USD")
        usd.write({"active": True, "rounding": 0.01})
        partner_model = cls.env["ir.model"]._get("res.partner")
        cls.env["ir.model.fields"].create(
            [
                {
                    "model_id": partner_model.id,
                    "name": "x_test_currency_id",
                    "ttype": "many2one",
                    "relation": "res.currency",
                    "field_description": "Test Currency",
                },
                {
                    "model_id": partner_model.id,
                    "name": "x_test_amount",
                    "ttype": "monetary",
                    "field_description": "Test Amount",
                    "currency_field": "x_test_currency_id",
                },
            ]
        )
        cls.env["res.partner"].create(
            [
                {"name": "JPY 1", "x_test_currency_id": jpy.id, "x_test_amount": 1000},
                {"name": "JPY 2", "x_test_currency_id": jpy.id, "x_test_amount": 2000},
                {"name": "USD 1", "x_test_currency_id": usd.id, "x_test_amount": 50.50},
            ]
        )
        cls.pivot_view = cls.env["ir.ui.view"].create(
            {
                "name": "test.partner.monetary.pivot",
                "model": "res.partner",
                "type": "pivot",
                "arch": """
                    <pivot>
                        <field name="x_test_currency_id" type="row"/>
                        <field name="x_test_amount" type="measure"/>
                    </pivot>
                """,
            }
        )
        cls.action = cls.env["ir.actions.act_window"].create(
            {
                "name": "Test Monetary Pivot",
                "res_model": "res.partner",
                "view_mode": "pivot",
                "view_id": cls.pivot_view.id,
                "domain": [("x_test_currency_id", "!=", False)],
            }
        )

    def test_pivot_monetary_format(self):
        self.start_tour(
            f"/odoo/action-{self.action.id}",
            "web_view_monetary_format_tour",
            login="admin",
        )

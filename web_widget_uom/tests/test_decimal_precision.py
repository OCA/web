from odoo.tests import common


class TestWebWidgetUom(common.TransactionCase):
    def test_web_widget_uom(self):
        Uom = self.env["uom.uom"]
        uom_unit = self.env.ref("uom.product_uom_unit")

        uom_unit.write({"decimal_places": 5})
        self.assertTrue(isinstance(uom_unit._onchange_decimal_places(), dict))
        self.assertEqual(Uom.get_decimal_places(uom_unit.id, 0.1234567), 5)

        uom_unit.write({"show_only_inputed_decimals": True})
        self.assertEqual(Uom.get_decimal_places(uom_unit.id, 0.1), 1)

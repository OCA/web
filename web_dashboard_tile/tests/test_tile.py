# © 2016 Antonio Espinosa - <antonio.espinosa@tecnativa.com>
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from odoo.tests.common import TransactionCase


class TestTile(TransactionCase):
    def test_tile(self):
        TileTile = self.env["tile.tile"]
        model_id = self.env["ir.model"].search([("model", "=", "tile.tile")])
        category_id = self.env.ref("web_dashboard_tile.category_module").id
        field_id = self.env["ir.model.fields"].search(
            [("model_id", "=", model_id.id), ("name", "=", "sequence")]
        )
        self.tile1 = TileTile.create(
            {
                "name": "Count / Sum",
                "sequence": 1,
                "category_id": category_id,
                "model_id": model_id.id,
                "domain": "[('model_id', '=', %d)]" % model_id.id,
                "secondary_function": "sum",
                "secondary_field_id": field_id.id,
            }
        )
        self.tile2 = TileTile.create(
            {
                "name": "Min / Max",
                "sequence": 2,
                "category_id": category_id,
                "model_id": model_id.id,
                "domain": "[('model_id', '=', %d)]" % model_id.id,
                "primary_function": "min",
                "primary_field_id": field_id.id,
                "secondary_function": "max",
                "secondary_field_id": field_id.id,
            }
        )
        self.tile3 = TileTile.create(
            {
                "name": "Avg / Median",
                "sequence": 3,
                "category_id": category_id,
                "model_id": model_id.id,
                "domain": "[('model_id', '=', %d)]" % model_id.id,
                "primary_function": "avg",
                "primary_field_id": field_id.id,
                "secondary_function": "median",
                "secondary_field_id": field_id.id,
            }
        )
        # count
        self.assertEqual(self.tile1.primary_value, 3.0)
        # sum
        self.assertEqual(self.tile1.secondary_value, 6.0)
        # min
        self.assertEqual(self.tile2.primary_value, 1.0)
        # max
        self.assertEqual(self.tile2.secondary_value, 3.0)
        # average
        self.assertEqual(self.tile3.primary_value, 2.0)
        # median
        self.assertEqual(self.tile3.secondary_value, 2.0)

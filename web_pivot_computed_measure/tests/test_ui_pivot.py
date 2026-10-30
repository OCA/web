# Copyright 2022 Tecnativa - Carlos Roca
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html)

from odoo.tests import HttpCase, tagged


@tagged("post_install", "-at_install")
class TestUIPivot(HttpCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        # Own data to not depend on demo data nor on the partners created by
        # other modules. Values are chosen so the expected results can't
        # match any other cell of the table.
        cls.partners = cls.env["res.partner"].create(
            [
                {
                    "name": "Pivot Computed A",
                    "partner_latitude": 11.11,
                    "partner_longitude": 22.22,
                },
                {
                    "name": "Pivot Computed B",
                    "partner_latitude": 44.44,
                    "partner_longitude": 1.01,
                },
            ]
        )
        cls.view = cls.env["ir.ui.view"].create(
            {
                "name": "res.partner.pivot.computed.measure.test",
                "model": "res.partner",
                "type": "pivot",
                "arch": """
                    <pivot>
                        <field name="name" type="row"/>
                    </pivot>
                """,
            }
        )
        cls.action = cls.env["ir.actions.act_window"].create(
            {
                "name": "Pivot Computed Measure Test",
                "res_model": "res.partner",
                "view_mode": "pivot",
                "view_id": cls.view.id,
                "domain": [("id", "in", cls.partners.ids)],
            }
        )

    def test_ui(self):
        self.start_tour(
            f"/odoo/action-{self.action.id}",
            "web_pivot_computed_measure_tour",
            login="admin",
        )

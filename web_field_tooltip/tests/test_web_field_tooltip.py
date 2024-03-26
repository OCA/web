# Copyright 2023 ACSONE SA/NV
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

from odoo.exceptions import UserError
from odoo.tests.common import Form, TransactionCase


class TestWebFieldTooltip(TransactionCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.Tooltip = cls.env["ir.model.fields.tooltip"]
        cls.partner_model_name = "res.partner"
        cls.partner_model = cls.env["ir.model"].search(
            [("model", "=", cls.partner_model_name)]
        )
        cls.email_partner_field = cls.env["ir.model.fields"].search(
            [("model", "=", cls.partner_model_name), ("name", "=", "email")]
        )
        cls.email_tooltip = cls.Tooltip.create(
            {
                "model_id": cls.partner_model.id,
                "field_id": cls.email_partner_field.id,
                "tooltip_text": "this explains a lot",
            }
        )

    def test_duplicate_constrains(self):
        with self.assertRaises(UserError) as e:
            self.email_tooltip = self.Tooltip.create(
                {
                    "model_id": self.partner_model.id,
                    "field_id": self.email_partner_field.id,
                    "tooltip_text": "this explains a lot",
                }
            )
        self.assertIn(e.exception.args[0], "A tooltip already exists for this field")

    def test_tooltip_name(self):
        self.assertEqual(
            self.email_tooltip.name, "Tooltip for {} on {}".format("email", "Contact")
        )

    def test_tooltip_model_id(self):
        res_partner_form = Form(
            self.Tooltip.with_context(default_model=self.partner_model_name)
        )
        self.assertEqual(res_partner_form.model_id, self.partner_model)

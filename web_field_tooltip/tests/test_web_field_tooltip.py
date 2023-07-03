# Copyright 2023 ACSONE SA/NV
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

from odoo.exceptions import UserError
from odoo.tests.common import Form, SavepointCase


class TestWebFieldTooltip(SavepointCase):
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
            {"model_id": cls.partner_model.id, "field_id": cls.email_partner_field.id}
        )

    def test_duplicate_constrains(self):
        with self.assertRaises(UserError):
            self.email_tooltip = self.Tooltip.create(
                {
                    "model_id": self.partner_model.id,
                    "field_id": self.email_partner_field.id,
                }
            )

    def test_tooltip_name(self):
        self.assertEqual(
            self.email_tooltip.name, "Tooltip for {} on {}".format("email", "Contact")
        )

    def test_tooltip_model_id(self):
        res_partner_form = Form(
            self.Tooltip.with_context(tooltip_model=self.partner_model_name)
        )
        self.assertEqual(res_partner_form.model_id, self.partner_model)

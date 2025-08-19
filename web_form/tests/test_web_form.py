# Copyright 2019 ACSONE SA/NV
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

from dateutil.relativedelta import relativedelta

from odoo.exceptions import ValidationError
from odoo.fields import Date
from odoo.tests.common import TransactionCase

from ..tools import evaluate_python_expression


class TestWebForm(TransactionCase):
    def setUp(self):
        super().setUp()
        self.partner = self.env["res.partner"].search([], limit=1)

    def test_evaluate_python_expression_without_data(self):
        self.assertEqual(evaluate_python_expression("'string'"), "string")
        self.assertEqual(evaluate_python_expression('"string"'), "string")
        self.assertEqual(evaluate_python_expression("1"), 1)
        self.assertEqual(evaluate_python_expression("1.5"), 1.5)
        self.assertEqual(evaluate_python_expression("''"), "")
        self.assertEqual(evaluate_python_expression(""), "")
        self.assertEqual(evaluate_python_expression("True"), True)
        self.assertEqual(evaluate_python_expression("False"), False)
        self.assertEqual(evaluate_python_expression(None), None)
        self.assertNotEqual(evaluate_python_expression(None), False)

    def test_evaluate_python_expression_with_data(self):
        data = {"partner": self.partner}
        self.assertEqual(
            evaluate_python_expression("partner.name", data), self.partner.name
        )
        self.assertEqual(
            evaluate_python_expression("partner.id", data), self.partner.id
        )
        self.assertEqual(
            evaluate_python_expression("partner.commercial_partner_id.ref", data),
            self.partner.commercial_partner_id.ref,
        )
        with self.assertRaises(ValidationError):
            evaluate_python_expression("partner.commercial_partner_id", data)
        with self.assertRaises(ValidationError):
            evaluate_python_expression("partner", data)
        with self.assertRaises(ValidationError):
            evaluate_python_expression("partner.", data)
        with self.assertRaises(ValidationError):
            evaluate_python_expression("partner.not_field", data)
        with self.assertRaises(ValidationError):
            evaluate_python_expression("partner.child_ids", data)
        with self.assertRaises(ValidationError):
            evaluate_python_expression("partner.ids", data)
        with self.assertRaises(ValidationError):
            evaluate_python_expression("partner.search([])", data)
        with self.assertRaises(ValidationError):
            evaluate_python_expression("partner.mapped('name')", data)

    def test_evaluate_date_python_expression(self):
        self.assertNotIsInstance(evaluate_python_expression("context_today()"), Date)
        self.assertEqual(evaluate_python_expression("context_today()"), Date.today())
        self.assertEqual(
            evaluate_python_expression("context_today() + relativedelta(days=30)"),
            Date.today() + relativedelta(days=30),
        )

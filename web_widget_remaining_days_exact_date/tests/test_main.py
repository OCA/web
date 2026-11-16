from odoo import exceptions
from odoo.tests import tagged

from odoo.addons.base.tests.common import BaseCommon


@tagged("post_install", "-at_install")
class TestWidgetRemainingDaysExactDate(BaseCommon):
    def test_global_disable(self):
        company_id = self.env.company
        company_id.disable_remaining_days = True
        response = self.env["disable.remaining.days.rule"].get_all_rules()
        self.assertTrue(response)
        company_id.disable_remaining_days = False
        response = self.env["disable.remaining.days.rule"].get_all_rules()
        self.assertFalse(response)

    def test_rule_per_model(self):
        self.env.company.disable_remaining_days = False
        model_name = "res.partner"
        model = self.env["ir.model"].search([("model", "=", model_name)], limit=1)
        self.env["disable.remaining.days.rule"].create(
            {
                "res_model_id": model.id,
                "active": True,
            }
        )
        with self.assertRaises(exceptions.UserError) as e:
            self.env["disable.remaining.days.rule"].create(
                {
                    "res_model_id": model.id,
                    "active": True,
                }
            )
        # Check that creating another rule for the same model raises an error
        self.assertIn("There is already a rule for the model", e.exception.args[0])
        # Check rules
        # Expect: "{'res.partner': {'model': True, 'view_types': [], 'fields': []}}"
        rules = self.env["disable.remaining.days.rule"].get_all_rules()
        self.assertIn(model_name, rules)
        self.assertTrue(rules[model_name]["model"])
        self.assertEqual(rules[model_name]["view_types"], [])
        self.assertEqual(rules[model_name]["fields"], [])

    def test_rule_per_model_and_view_type(self):
        self.env.company.disable_remaining_days = False
        model_name = "res.partner"
        model = self.env["ir.model"].search([("model", "=", model_name)], limit=1)
        rule = self.env["disable.remaining.days.rule"].create(
            {
                "res_model_id": model.id,
                "active": True,
            }
        )
        action = rule.action_open_set_disable_remaining_days_rule_wizard()
        wizard = self.env["disable.remaining.days.rule.wizard"].browse(action["res_id"])
        # Activate 'form' and 'list' view types
        for line in wizard.line_ids:
            if line.technical_name in ["list", "form"]:
                line.selected = True
        wizard.action_define_remaining_days_rule_by_view_type()
        # Check rules
        # Expect: "
        #     {
        #         'res.partner': {
        #             'model': True,
        #             'view_types': ['list', 'form'],
        #             'fields': []
        #         }
        rules = self.env["disable.remaining.days.rule"].get_all_rules()
        self.assertIn(model_name, rules)
        self.assertFalse(rules[model_name]["model"])
        self.assertEqual(rules[model_name]["view_types"], ["list", "form"])
        self.assertEqual(rules[model_name]["fields"], [])

    def test_rule_per_model_and_fields(self):
        self.env.company.disable_remaining_days = False
        model_name = "ir.module.module"
        model = self.env["ir.model"].search([("model", "=", model_name)], limit=1)
        rule = self.env["disable.remaining.days.rule"].create(
            {
                "res_model_id": model.id,
                "active": True,
            }
        )
        field_1 = self.env["ir.model.fields"].search(
            [("model_id", "=", model.id), ("name", "=", "create_date")], limit=1
        )
        field_2 = self.env["ir.model.fields"].search(
            [("model_id", "=", model.id), ("name", "=", "write_date")], limit=1
        )
        rule.date_type_fields_ids = [(6, 0, [field_1.id, field_2.id])]
        # Check rules
        # Expect: "
        #     {
        #         'ir.module.module': {
        #                 'model': False,
        #                 'view_types': [],
        #                 'fields': ['create_date', 'write_date']
        #             }
        #     }"
        rules = self.env["disable.remaining.days.rule"].get_all_rules()
        self.assertIn(model_name, rules)
        self.assertFalse(rules[model_name]["model"])
        self.assertEqual(rules[model_name]["view_types"], [])
        self.assertEqual(
            sorted(rules[model_name]["fields"]), sorted(["create_date", "write_date"])
        )

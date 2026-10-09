# Copyright 2026 - TODAY, Cristiano Mafra Junior <cristiano.mafra@escodoo.com.br>
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

from odoo.tests import HttpCase, TransactionCase, tagged


# This module only depends on `web`, so it is loaded long before modules
# like `account` that extend generic models such as `res.partner`. Running
# at install time would build those records against a partial registry.
@tagged("post_install", "-at_install")
class TestX2manyDeleteConfirmRule(TransactionCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.rule_model = cls.env["x2many.delete.confirm.rule"]
        cls.line_model = cls.env.ref("base.model_res_partner_bank")
        cls.parent_model = cls.env.ref("base.model_res_partner")
        # A group nobody belongs to, to check that restricted rules are hidden
        # from the users outside of them.
        cls.empty_group = cls.env["res.groups"].create({"name": "No one"})

    def _create_rule(self, **kwargs):
        values = {"name": "Test rule", "model_id": self.line_model.id}
        values.update(kwargs)
        return self.rule_model.create(values)

    def _rules(self):
        # Creating a company adds it to the allowed ones of the current user,
        # so pin the active company to keep the company filter deterministic.
        return self.rule_model.with_context(
            allowed_company_ids=self.env.company.ids
        )._get_rules_for_user()

    def test_rule_is_returned_for_every_user_by_default(self):
        self._create_rule(
            parent_model_id=self.parent_model.id, message="Really delete it?"
        )
        self.assertEqual(
            self._rules()["res.partner.bank"],
            [
                {
                    "parent_model": "res.partner",
                    "title": False,
                    "message": "Really delete it?",
                }
            ],
        )

    def test_empty_title_and_message_fall_back_on_the_client(self):
        self._create_rule()
        rule = self._rules()["res.partner.bank"][0]
        self.assertFalse(rule["title"])
        self.assertFalse(rule["message"])

    def test_rule_restricted_to_another_group_is_filtered_out(self):
        self._create_rule(group_ids=[(6, 0, self.empty_group.ids)])
        self.assertNotIn("res.partner.bank", self._rules())

    def test_rule_restricted_to_a_group_of_the_user_is_returned(self):
        self._create_rule(group_ids=[(6, 0, [self.env.ref("base.group_user").id])])
        self.assertIn("res.partner.bank", self._rules())

    def test_rule_of_another_company_is_filtered_out(self):
        company = self.env["res.company"].create({"name": "Other company"})
        self._create_rule(company_id=company.id)
        self.assertNotIn("res.partner.bank", self._rules())

    def test_archived_rule_is_not_returned(self):
        self._create_rule().active = False
        self.assertNotIn("res.partner.bank", self._rules())

    def test_rules_are_ordered_by_sequence(self):
        self._create_rule(name="Generic", sequence=20)
        self._create_rule(
            name="Specific", sequence=10, parent_model_id=self.parent_model.id
        )
        self.assertEqual(
            [r["parent_model"] for r in self._rules()["res.partner.bank"]],
            ["res.partner", False],
        )


@tagged("post_install", "-at_install")
class TestX2manyDeleteConfirmHoot(HttpCase):
    """Run the hoot suite of this module, which the CI would skip otherwise."""

    def test_js(self):
        self.browser_js(
            "/web/tests?headless&loglevel=2&preset=desktop"
            "&filter=X2manyDeleteConfirm",
            "",
            "",
            login="admin",
            success_signal="[HOOT] Test suite succeeded",
            error_checker=lambda message: "[HOOT]" not in message,
        )

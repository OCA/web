# Copyright 2024 ooops404
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from odoo.tests import common


class TestWebRecordRuleInterface(common.SavepointCase):
    @classmethod
    def setUpClass(cls):
        super(TestWebRecordRuleInterface, cls).setUpClass()

    def test_all_web_record_rule_interface(self):
        model_id = self.env["ir.model"].search([], limit=1).id
        self.env["ir.rule"].create(
            {
                "name": "Test Rule 1",
                "model_id": model_id,
                "domain": "[(1, '=', 1)]",
            }
        )

        rule2 = self.env["ir.rule"].create(
            {
                "name": "Test Rule 2",
                "model_id": model_id,
                "domain_force": "[(1, '=', 1)]",
            }
        )

        rule2.domain_force = ""
        rule2.action_restore_original_domain()
        self.assertEqual(rule2.domain_force, rule2.original_domain)

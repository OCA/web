# Copyright 2019 Onestein BV
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).
from odoo.tests.common import TransactionCase


class TestAccessRuleButtons(TransactionCase):
    def setUp(self):
        super(TestAccessRuleButtons, self).setUp()

        self.curr_obj = self.env["res.currency"]
        self.curr_record = self.env.ref("base.USD")

    def test_check_access_rule_1(self):
        res = self.curr_obj.check_access_rule_all(["write"])
        self.assertFalse(res["write"])

    def test_check_access_rule_2(self):
        res = self.curr_record.check_access_rule_all(["write"])
        self.assertTrue(res["write"])

    def test_check_access_rule_3(self):
        res = self.curr_record.check_access_rule_all()
        self.assertTrue(res["read"])
        self.assertTrue(res["create"])
        self.assertTrue(res["write"])
        self.assertTrue(res["unlink"])

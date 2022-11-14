# Copyright 2019 Onestein BV
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).
from odoo.tests import common, new_test_user, users


class TestAccessRuleButtons(common.TransactionCase):
    def setUp(self):
        super().setUp()
        self.curr_record = self.env.ref("base.USD")
        new_test_user(self.env, login="test-user", groups="base.group_system")
        self.env.ref("base.user_admin").write(
            {
                "groups_id": [(4, self.env.ref("base.group_system").id)],
            }
        )

    @users("admin", "test-user")
    def test_check_access_rule_1(self):
        res = self.env["res.currency"].check_access_rule_all(["write"])
        self.assertTrue(res["write"])

    @users("admin", "test-user")
    def test_check_access_rule_2(self):
        res = (
            self.env["res.currency"]
            .browse(self.curr_record.id)
            .check_access_rule_all(["write"])
        )
        self.assertTrue(res["write"])

    @users("admin", "test-user")
    def test_check_access_rule_3(self):
        res = (
            self.env["res.currency"].browse(self.curr_record.id).check_access_rule_all()
        )
        self.assertTrue(res["read"])
        self.assertTrue(res["create"])
        self.assertTrue(res["write"])
        self.assertTrue(res["unlink"])

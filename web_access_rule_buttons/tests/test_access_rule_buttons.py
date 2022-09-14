# Copyright 2019 Onestein BV
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).
from odoo.tests.common import TransactionCase


class TestAccessRuleButtons(TransactionCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()

        public_user = cls.env.ref("base.public_user")
        admin_user = cls.env.ref("base.partner_admin")
        curr_record = cls.env.ref("base.USD")
        wizard_record = cls.env["base.module.upgrade"].create({})

        cls.curr_record = curr_record.with_user(admin_user)
        cls.wizard_record = wizard_record.with_user(public_user)
        cls.access_rule = cls.env["ir.rule"].create(
            {
                "name": "Test Record Rule",
                "model_id": cls.env.ref("base.model_res_currency").id,
                "active": True,
                "global": True,
                "domain_force": "[('id', '=', -1)]",
                "perm_read": False,
                "perm_write": False,
                "perm_create": True,
                "perm_unlink": True,
            }
        )

    def test_check_access_rule_1(self):
        res = self.curr_record.check_access_rule_all(["unlink"])
        self.assertFalse(res["unlink"])

    def test_check_access_rule_2(self):
        res = self.curr_record.check_access_rule_all(["read"])
        self.assertTrue(res["read"])

    def test_check_access_rule_3(self):
        res = self.curr_record.check_access_rule_all()
        self.assertTrue(res["read"])
        self.assertTrue(res["write"])
        self.assertFalse(res["create"])
        self.assertFalse(res["unlink"])

    def test_check_access_rule_4(self):
        """Check that unprivileged users can still acces transient models"""
        res = self.wizard_record.check_access_rule_all()
        self.assertTrue(res["read"])
        self.assertTrue(res["write"])
        self.assertTrue(res["create"])
        self.assertTrue(res["unlink"])

    def test_check_access_rule_5(self):
        """Check that access is allowed on empty recordsets"""
        res = self.env["res.currency"].check_access_rule_all()
        self.assertTrue(res["read"])
        self.assertTrue(res["write"])
        self.assertTrue(res["create"])
        self.assertTrue(res["unlink"])

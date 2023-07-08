from odoo.exceptions import AccessError
from odoo.tests.common import SavepointCase


class TestIrModel(SavepointCase):
    @classmethod
    def setUpClass(cls):
        super(TestIrModel, cls).setUpClass()
        cls.readonly_group = cls.env.ref("base.group_user")
        cls.group_manager = cls.env.ref("base.group_erp_manager")
        cls.group_partner_manager = cls.env.ref("base.group_partner_manager")
        cls.partner_model = cls.env["ir.model"]._get("res.partner")
        res_users_obj = cls.env["res.users"]
        cls.manager = res_users_obj.create(
            {
                "name": "Manager",
                "login": "Manager",
                "groups_id": [
                    (4, cls.group_manager.id),
                    (4, cls.group_partner_manager.id),
                ],
            }
        )
        cls.user_readonly = res_users_obj.create(
            {
                "name": "User readonly",
                "login": "user_readonly",
                "groups_id": cls.readonly_group,
            }
        )

    def test_check_access_rights_readonly(self):
        """Tests check_access_rights function for readonly group"""

        model = self.partner_model.with_user(self.user_readonly)
        self.assertTrue(model.check_access_rights("read", False))
        self.assertFalse(model.check_access_rights("write", False))
        self.assertFalse(model.check_access_rights("create", False))
        self.assertFalse(model.check_access_rights("unlink", False))

    def test_check_access_rights_manager(self):
        """Tests check_access_rights function for manager group

        checks acces rights by user in manager group
        checks accer rights after adds this user to readonly group
        """

        # model = self.partner_model.with_user(self.manager)
        test_record = self.env["res.partner"].create({"name": "Test Record"})
        test_record = test_record.with_user(self.manager)
        # group_manager have access to all operations by default
        self.assertNotIn(self.group_manager, self.partner_model.readonly_group_ids)
        self.assertNotIn(
            self.group_partner_manager, self.partner_model.readonly_group_ids
        )
        self.assertTrue(test_record.check_access_rights("read", False))
        self.assertTrue(test_record.check_access_rights("write", False))
        self.assertTrue(test_record.check_access_rights("create", False))
        self.assertTrue(test_record.check_access_rights("unlink", False))

        # Add group_manager to readonly_group_ids
        self.partner_model.write({"readonly_group_ids": [(4, self.group_manager.id)]})
        self.assertIn(self.group_manager, self.partner_model.readonly_group_ids)
        self.assertTrue(test_record.check_access_rights("read", False))

        # If raise_exception is not expected, function will return False
        self.assertFalse(test_record.check_access_rights("write", False))
        self.assertFalse(test_record.check_access_rights("create", False))
        self.assertFalse(test_record.check_access_rights("unlink", False))

        # If raise_exception is expected, function will return AccessError
        with self.assertRaises(AccessError):
            test_record.check_access_rights("write", raise_exception=True)
        with self.assertRaises(AccessError):
            test_record.check_access_rights("create", raise_exception=True)
        with self.assertRaises(AccessError):
            test_record.check_access_rights("unlink", raise_exception=True)

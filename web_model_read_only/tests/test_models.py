from odoo.exceptions import AccessError
from odoo.tests.common import SavepointCase


class TestIrModel(SavepointCase):
    @classmethod
    def setUpClass(cls):
        super(TestIrModel, cls).setUpClass()
        cls.readonly_group = cls.env.ref("base.group_user")
        cls.group_manager = cls.env.ref("base.group_erp_manager")
        cls.ir_model = cls.env["ir.model"].create(
            {"name": "x_test_model", "model": "x_test.model"}
        )
        User = cls.env["res.users"]
        cls.manager = User.create(
            {
                "name": "Manager",
                "login": "Manager",
                "groups_id": cls.group_manager,
            }
        )
        cls.user_readonly = User.create(
            {
                "name": "User readonly",
                "login": "user_readonly",
                "groups_id": cls.readonly_group,
            }
        )

    def test_check_access_rights(self):
        """Tests check_access_rights function

        if operation 'read' or selected user not in readonly group,
        the expected return value is False
        """
        self.ir_model.readonly_group_ids = self.readonly_group

        # Test with a user who is in the readonly group
        self.assertFalse(
            self.env["x_test.model"]
            .with_user(self.user_readonly)
            .check_access_rights("read", raise_exception=False)
        )
        # If raise_exception not expected function will return False
        self.assertFalse(
            self.env["x_test.model"]
            .with_user(self.user_readonly)
            .check_access_rights("write", raise_exception=False)
        )
        with self.assertRaises(AccessError):
            self.env["x_test.model"].with_user(self.user_readonly).check_access_rights(
                "write", raise_exception=True
            )
        with self.assertRaises(AccessError):
            self.env["x_test.model"].with_user(self.user_readonly).check_access_rights(
                "create", raise_exception=True
            )
        with self.assertRaises(AccessError):
            self.env["x_test.model"].with_user(self.user_readonly).check_access_rights(
                "unlink", raise_exception=True
            )
        # Test with a user who is not in the readonly group
        self.assertFalse(
            self.env["x_test.model"]
            .with_user(self.manager)
            .check_access_rights("read", raise_exception=False)
        )
        self.assertFalse(
            self.env["x_test.model"]
            .with_user(self.manager)
            .check_access_rights("create", raise_exception=False)
        )
        self.assertFalse(
            self.env["x_test.model"]
            .with_user(self.manager)
            .check_access_rights("unlink", raise_exception=False)
        )
        self.assertFalse(
            self.env["x_test.model"]
            .with_user(self.manager)
            .check_access_rights("write", raise_exception=False)
        )

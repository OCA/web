# Copyright 2024 ooops404
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from odoo.tests import Form, common


class TestWebFieldEmptyOnCreate(common.SavepointCase):
    @classmethod
    def setUpClass(cls):
        super(TestWebFieldEmptyOnCreate, cls).setUpClass()
        cls.user_groups_field = cls.env["ir.model.fields"].search(
            [("model", "=", "res.users"), ("name", "=", "groups_id")]
        )
        cls.user_image_1920_field = cls.env["ir.model.fields"].search(
            [("model", "=", "res.users"), ("name", "=", "image_1920")]
        )
        cls.groups_model = cls.env["ir.model"]._get("res.groups")
        cls.users_model = cls.env["ir.model"]._get("res.users")
        cls.partner_model = cls.env["ir.model"]._get("res.partner")

    def test_web_field_empty_on_create_all(self):
        user_form_1 = Form(self.env["res.users"])
        # default groups is set here
        self.assertNotEqual(user_form_1._values["groups_id"], [(6, False, [])])
        rule_1 = self.env["field.empty.rule"].create(
            {
                "field_id": self.user_groups_field.id,
                "model_id": self.users_model.id,
            }
        )
        user_form_2 = Form(self.env["res.users"])
        # default groups is empty here
        self.assertEqual(user_form_2._values["groups_id"], [(6, False, [])])

        # lets change field
        rule_1.field_id = self.user_image_1920_field
        user_form_3 = Form(self.env["res.users"])
        # default groups is prefilled again
        self.assertNotEqual(user_form_3._values["groups_id"], [(6, False, [])])
        # default image_1920 is empty now
        self.assertEqual(user_form_3._values["image_1920"], False)

        # create new field referencing res.users
        self.test_field = self.env["ir.model.fields"].create(
            {
                "name": "x_test_field",
                "field_description": "x_Test Field Res Users",
                "model_id": self.partner_model.id,
                "relation": self.users_model.model,
                "store": False,
                "state": "manual",
                "ttype": "many2one",
            }
        )
        # new option should be created for the new field
        new_option = self.env["m2x.create.edit.option"].search(
            [("field_id", "=", self.test_field.id)]
        )
        self.assertTrue(new_option.id)

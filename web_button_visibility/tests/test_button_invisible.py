# Copyright 2023 ooops404
# Copyright 2025 Simone Rubino - PyTech
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).
from odoo.exceptions import ValidationError
from odoo.tests import common
from odoo.tools import get_cache_key_counter


class TestButtonInvisible(common.TransactionCase):
    def setUp(self):
        super(TestButtonInvisible, self).setUp()
        self.res_users_model = self.env["ir.model"].search(
            [("model", "=", "res.users")]
        )
        self.group_user = self.env.ref("base.group_user")
        self.view_users_form1 = self.env.ref(
            "web_button_visibility.view_users_demo_form"
        )
        self.view_users_form2 = self.env.ref(
            "web_button_visibility.view_users_demo_form2"
        )
        self.view_users_demo_form3 = self.env.ref(
            "web_button_visibility.view_users_demo_form3"
        )
        self.admin_user = self.env.ref("base.user_admin")
        self.btn_rule_1 = self.env["model.button.rule"].create(
            {
                "button_name": "action_archive",
                "model_id": self.res_users_model.id,
                "group_ids": [(6, 0, self.group_user.ids)],
            }
        )
        self.btn_rule_2 = self.env["model.button.rule"].create(
            {
                "button_name": "action_show_groups",
                "model_id": self.res_users_model.id,
                "group_ids": [(6, 0, self.group_user.ids)],
                "condition_domain": [("name", "!=", "abc")],
            }
        )
        self.btn_rule_3 = self.env["model.button.rule"].create(
            {
                "button_name": "action_archive",
                "model_id": self.res_users_model.id,
                "group_ids": [(6, 0, self.group_user.ids)],
            }
        )

    def test_all(self):
        # action/button/method should exist
        with self.assertRaises(ValidationError):
            self.env["model.button.rule"].create(
                {
                    "button_name": "action_that_do_not_exist",
                    "model_id": self.res_users_model.id,
                    "group_ids": [(6, 0, self.group_user.ids)],
                }
            )
        # trigger fields_view_get
        arch1 = self.admin_user.fields_view_get(
            view_id=self.view_users_form1.id, view_type="form"
        )
        self.assertIn(
            "x_computed_button_hide_res_users_action_archive",
            str(arch1["arch"]),
            "Created field is not present in the view",
        )
        self.admin_user.fields_view_get(
            view_id=self.view_users_demo_form3.id, view_type="form"
        )
        arch3 = self.admin_user.fields_view_get(
            view_id=self.view_users_form2.id, view_type="form"
        )
        self.assertIn(
            "x_computed_button_hide_res_users_action_archive",
            str(arch3["arch"]),
            "Created field is not present in the view",
        )
        self.admin_user.read()
        self.env["res.users"].create({"name": "test", "login": "test"})

    def test_cache_found_rules(self):
        """The Rules found are cached by model."""
        # Arrange
        rule_model = self.env["model.button.rule"]
        rule_cached_method = rule_model._get_ids_by_model
        record = self.admin_user
        record_model = record._name
        rule_cached_method.clear_cache(rule_model)

        cache, key, counter = get_cache_key_counter(rule_cached_method, record_model)
        starting_hit_count = counter.hit
        starting_miss_count = counter.miss
        # pre-condition
        self.assertNotIn(key, cache)

        # Act 1: Compute the defaults 1st time
        record.default_get([])
        # Assert 1: Cache is missed -> the value is computed
        self.assertEqual(counter.hit, starting_hit_count)
        self.assertEqual(counter.miss, starting_miss_count + 1)

        # Act 2: Compute the defaults 2nd time
        record.default_get([])
        # Assert 2: Cache is used
        self.assertEqual(counter.hit, starting_hit_count + 1)
        self.assertEqual(counter.miss, starting_miss_count + 1)

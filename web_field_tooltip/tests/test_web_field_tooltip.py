# Copyright 2023 ACSONE SA/NV
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

from odoo import Command
from odoo.exceptions import UserError
from odoo.tests import Form, HttpCase, tagged
from odoo.tests.common import TransactionCase


class TestWebFieldTooltip(TransactionCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.Tooltip = cls.env["ir.model.fields.tooltip"]
        cls.partner_model_name = "res.partner"
        cls.partner_model = cls.env["ir.model"].search(
            [("model", "=", cls.partner_model_name)]
        )
        cls.email_partner_field = cls.env["ir.model.fields"].search(
            [("model", "=", cls.partner_model_name), ("name", "=", "email")]
        )
        cls.email_tooltip = cls.Tooltip.create(
            {
                "model_id": cls.partner_model.id,
                "field_id": cls.email_partner_field.id,
                "tooltip_text": "this explains a lot",
            }
        )

    def test_duplicate_constrains(self):
        with self.assertRaises(UserError) as e:
            self.email_tooltip = self.Tooltip.create(
                {
                    "model_id": self.partner_model.id,
                    "field_id": self.email_partner_field.id,
                    "tooltip_text": "this explains a lot",
                }
            )
        self.assertIn(e.exception.args[0], "A tooltip already exists for this field")

    def test_tooltip_name(self):
        self.assertEqual(
            self.email_tooltip.name, "Tooltip for {} on {}".format("email", "Contact")
        )

    def test_tooltip_model_id(self):
        res_partner_form = Form(
            self.Tooltip.with_context(default_model=self.partner_model_name)
        )
        self.assertEqual(res_partner_form.model_id, self.partner_model)

    def test_fields_get_adds_tooltip(self):
        fields = self.env[self.partner_model_name].fields_get(["email", "name"])
        self.assertEqual(
            fields["email"]["field_tooltip"]["tooltip_text"], "this explains a lot"
        )
        self.assertNotIn("field_tooltip", fields["name"])

    def test_default_get_from_field_name(self):
        defaults = self.Tooltip.with_context(
            default_model=self.partner_model_name, default_field_name="email"
        ).default_get(["model_id", "field_id"])
        self.assertEqual(defaults["model_id"], self.partner_model.id)
        self.assertEqual(defaults["field_id"], self.email_partner_field.id)

    def test_tooltip_manager(self):
        group_user = self.env.ref("base.group_user")
        group_manager = self.env.ref("web_field_tooltip.group_tooltip_manager")
        user = self.env["res.users"].create(
            {
                "name": "Tooltip User",
                "login": "tooltip_user",
                "group_ids": [Command.set(group_user.ids)],
            }
        )
        manager = self.env["res.users"].create(
            {
                "name": "Tooltip Manager",
                "login": "tooltip_manager",
                "group_ids": [Command.set((group_user | group_manager).ids)],
            }
        )
        self.assertFalse(user.tooltip_show_add_helper_allowed)
        self.assertTrue(manager.tooltip_show_add_helper_allowed)

    def test_user_sets_own_helper_flag(self):
        user = self.env["res.users"].create(
            {
                "name": "Tooltip User",
                "login": "tooltip_user",
                "group_ids": [Command.set(self.env.ref("base.group_user").ids)],
            }
        )
        user.with_user(user).write({"tooltip_show_add_helper": True})
        self.assertEqual(
            user.with_user(user).read(["tooltip_show_add_helper"])[0][
                "tooltip_show_add_helper"
            ],
            True,
        )


@tagged("post_install", "-at_install")
class TestWebFieldTooltipSession(HttpCase):
    def test_session_info(self):
        self.authenticate("admin", "admin")
        info = self.make_jsonrpc_request("/web/session/get_session_info")
        self.assertTrue(info["can_manage_tooltips"])
        self.assertFalse(info["tooltip_show_add_helper"])

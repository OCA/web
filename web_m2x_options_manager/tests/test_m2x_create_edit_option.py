# Copyright 2021 Camptocamp SA
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

from lxml import etree

from odoo.exceptions import ValidationError
from odoo.tests.common import TransactionCase
from odoo.tools.safe_eval import safe_eval


class TestM2xCreateEditOption(TransactionCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        ref = cls.env.ref
        # View to be used
        cls.view = ref("web_m2x_options_manager.res_partner_demo_form_view")
        # res.partner model and fields
        cls.res_partner_model = ref("base.model_res_partner")
        cls.categ_field = ref("base.field_res_partner__category_id")
        cls.title_field = ref("base.field_res_partner__title")
        cls.users_field = ref("base.field_res_partner__user_ids")
        # res.users model and fields
        cls.res_users_model = ref("base.model_res_users")
        cls.company_field = ref("base.field_res_users__company_id")
        # Options setup
        cls.title_opt = cls.env["m2x.create.edit.option"].create(
            {
                "field_id": cls.title_field.id,
                "model_id": cls.res_partner_model.id,
                "option_create": "set_true",
                "option_create_edit": "set_true",
            }
        )
        cls.category_opt = cls.env["m2x.create.edit.option"].create(
            {
                "field_id": cls.categ_field.id,
                "model_id": cls.res_partner_model.id,
                "option_create": "set_true",
                "option_create_edit": "set_true",
            }
        )
        cls.company_opt = cls.env["m2x.create.edit.option"].create(
            {
                "field_id": cls.company_field.id,
                "model_id": cls.res_users_model.id,
                "option_create": "force_true",
                "option_create_edit": "set_true",
            }
        )

    def test_errors(self):
        with self.assertRaisesRegex(
            ValidationError,
            r"'company_id' is not a valid field for model 'res.partner'!",
        ):
            # Fails ``_check_field_in_model``: model is res.partner, field is
            # ``res.users.company_id``
            self.env["m2x.create.edit.option"].create(
                {
                    "field_id": self.company_field.id,
                    "model_id": self.res_partner_model.id,
                    "option_create": "set_true",
                    "option_create_edit": "set_true",
                }
            )
        with self.assertRaisesRegex(
            ValidationError, r"Invalid model name: 'does.not.exists'"
        ):
            # Fails ``_inverse_model_name``
            self.category_opt.model_name = "does.not.exists"
        with self.assertRaisesRegex(
            ValidationError, r"Only Many2many and Many2one fields can be chosen!"
        ):
            # Fails ``_check_field_type``: ``res.partner.user_ids`` is a One2many
            self.env["m2x.create.edit.option"].create(
                {
                    "field_id": self.users_field.id,
                    "model_id": self.res_partner_model.id,
                    "option_create": "set_true",
                    "option_create_edit": "set_true",
                }
            )

    def test_apply_options(self):
        # Check fields on ``res.partner`` form view
        partner_form = etree.XML(self.env["res.partner"].get_view(self.view.id)["arch"])
        title_node = partner_form.xpath("//field[@name='title']")[0]
        self.assertEqual(
            safe_eval(title_node.attrib.get("options"), nocopy=True),
            {"create": True, "create_edit": True},
        )
        categ_node = partner_form.xpath("//field[@name='category_id']")[0]
        self.assertEqual(
            safe_eval(categ_node.attrib.get("options"), nocopy=True),
            {"create": False, "create_edit": True},
        )

        # Check fields on res.users tree view (contained in ``user_ids`` field)
        users_tree_view = partner_form.xpath("//field[@name='user_ids']/tree")[0]
        company_node = users_tree_view.xpath("//field[@name='company_id']")[0]
        self.assertEqual(
            safe_eval(company_node.attrib.get("options"), nocopy=True),
            {"create": True, "create_edit": True},
        )

        # Update options, check that node has been updated too
        self.title_opt.option_create_edit = "force_false"
        partner_form = etree.XML(self.env["res.partner"].get_view(self.view.id)["arch"])
        title_node = partner_form.xpath("//field[@name='title']")[0]
        self.assertEqual(
            safe_eval(title_node.attrib.get("options"), nocopy=True),
            {"create": True, "create_edit": False},
        )

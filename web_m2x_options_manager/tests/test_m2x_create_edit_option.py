# Copyright 2021 Camptocamp SA
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

from lxml import etree

from odoo.exceptions import ValidationError
from odoo.tests.common import TransactionCase
from odoo.tools.safe_eval import safe_eval


class TestM2xCreateEditOption(TransactionCase):
    def setUp(self):
        super(TestM2xCreateEditOption, self).setUp()
        ref = self.env.ref
        # View to be used
        self.view = ref("web_m2x_options_manager.res_partner_demo_form_view")
        # res.partner model and fields
        self.res_partner_model = ref("base.model_res_partner")
        self.categ_field = ref("base.field_res_partner__category_id")
        self.title_field = ref("base.field_res_partner__title")
        self.users_field = ref("base.field_res_partner__user_ids")
        # res.users model and fields
        self.res_users_model = ref("base.model_res_users")
        self.company_field = ref("base.field_res_users__company_id")
        # Options setup
        self.title_opt = self.env["m2x.create.edit.option"].create(
            {
                "field_id": self.title_field.id,
                "model_id": self.res_partner_model.id,
                "option_create": "set_true",
                "option_create_edit": "set_true",
                "option_create_edit_wizard": True,
            }
        )
        self.categories_opt = self.env["m2x.create.edit.option"].create(
            {
                "field_id": self.categ_field.id,
                "model_id": self.res_partner_model.id,
                "option_create": "set_true",
                "option_create_edit": "set_true",
                "option_create_edit_wizard": True,
            }
        )
        self.company_opt = self.env["m2x.create.edit.option"].create(
            {
                "field_id": self.company_field.id,
                "model_id": self.res_users_model.id,
                "option_create": "force_true",
                "option_create_edit": "set_true",
                "option_create_edit_wizard": False,
            }
        )

    def test_errors(self):
        with self.assertRaises(ValidationError):
            # Fails ``_check_field_in_model``: model is res.partner, field is
            # res.users's company_id
            self.env["m2x.create.edit.option"].create(
                {
                    "field_id": self.company_field.id,
                    "model_id": self.res_partner_model.id,
                    "option_create": "set_true",
                    "option_create_edit": "set_true",
                }
            )
        with self.assertRaises(ValidationError):
            # Fails ``_check_field_type``: users_field is a One2many
            self.env["m2x.create.edit.option"].create(
                {
                    "field_id": self.users_field.id,
                    "model_id": self.res_partner_model.id,
                    "option_create": "set_true",
                    "option_create_edit": "set_true",
                }
            )

    def test_apply_options(self):
        res = self.env["res.partner"].get_view(self.view.id)

        # Check fields on res.partner form view
        form_arch = res["arch"]
        form_doc = etree.XML(form_arch)
        title_node = form_doc.xpath("//field[@name='title']")[0]
        self.assertEqual(
            safe_eval(title_node.attrib.get("options"), nocopy=True),
            {"create": True, "create_edit": True},
        )
        self.assertEqual(
            (
                title_node.attrib.get("can_create"),
                title_node.attrib.get("can_write"),
            ),
            ("true", "true"),
        )
        categ_node = form_doc.xpath("//field[@name='category_id']")[0]
        self.assertEqual(
            safe_eval(categ_node.attrib.get("options"), nocopy=True),
            {"create": False, "create_edit": True},
        )
        # Check fields on res.users tree view (contained in ``user_ids`` field)
        company_node = form_doc.xpath("//field[@name='company_id']")[0]
        self.assertEqual(
            safe_eval(company_node.attrib.get("options"), nocopy=True),
            {
                "create": False,
                "no_create": False,
                "create_edit": True,
                "no_quick_create": True,
            },
        )
        # Update options, check that node has been updated too
        self.title_opt.option_create_edit = "force_false"
        res = self.env["res.partner"].get_view(self.view.id)
        form_arch = res["arch"]
        form_doc = etree.XML(form_arch)
        title_node = form_doc.xpath("//field[@name='title']")[0]
        self.assertEqual(
            safe_eval(title_node.attrib.get("options"), nocopy=True),
            {"create": True, "create_edit": False, "no_create_edit": True},
        )

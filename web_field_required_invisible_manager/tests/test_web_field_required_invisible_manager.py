# Copyright 2023 ooops404
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from odoo.tests import Form, common


class TestFieldRequiredIvisibleManager(common.SavepointCase):
    @classmethod
    def setUpClass(cls):
        super(TestFieldRequiredIvisibleManager, cls).setUpClass()
        cls.view_model = cls.env["ir.ui.view"].sudo()
        cls.partner_name_field_id = cls.env["ir.model.fields"].search(
            [("model", "=", "res.partner"), ("name", "=", "name")]
        )
        cls.partner_id_field_id = cls.env["ir.model.fields"].search(
            [("model", "=", "res.partner"), ("name", "=", "name")]
        )
        cls.partner_model_id = cls.partner_name_field_id.model_id
        cls.partner_title_model_id = cls.env["ir.model"].search(
            [("model", "=", "res.partner.title")]
        )
        cls.partner_title_name_field_id = cls.env["ir.model.fields"].search(
            [("model", "=", "res.partner.title"), ("name", "=", "name")]
        )
        cls.partner_name_field_id = cls.env["ir.model.fields"].search(
            [("model", "=", "res.partner"), ("name", "=", "name")]
        )
        cls.partner_title_shortcut_field_id = cls.env["ir.model.fields"].search(
            [("model", "=", "res.partner.title"), ("name", "=", "shortcut")]
        )
        cls.invisible_title_rec_id = cls.env["custom.field.restriction"].create(
            {
                "invisible_model_id": cls.partner_title_model_id.id,
                "field_id": cls.partner_title_shortcut_field_id.id,
                "group_ids": [(6, 0, cls.env.ref("base.group_user").ids)],
                "field_invisible": True,
            }
        )
        cls.invisible_rec_id = cls.env["custom.field.restriction"].create(
            {
                "invisible_model_id": cls.partner_model_id.id,
                "field_id": cls.partner_id_field_id.id,
                "group_ids": [(6, 0, cls.env.ref("base.group_user").ids)],
                "field_invisible": True,
                "condition_domain": "[('id', '<', 0)]",
            }
        )
        cls.required_rec_id = cls.env["custom.field.restriction"].create(
            {
                "required_model_id": cls.partner_model_id.id,
                "field_id": cls.partner_id_field_id.id,
                "group_ids": [(6, 0, cls.env.ref("base.group_user").ids)],
                "required": True,
                "condition_domain": "[('id', '>', 0)]",
            }
        )
        cls.readonly_rec_id = cls.env["custom.field.restriction"].create(
            {
                "readonly_model_id": cls.partner_model_id.id,
                "field_id": cls.partner_id_field_id.id,
                "group_ids": [(6, 0, cls.env.ref("base.group_user").ids)],
                "field_readonly": True,
                "condition_domain": "[('id', '>', 0)]",
            }
        )
        cls.res_partner_title_madam = cls.env.ref("base.res_partner_title_madam")
        cls.deco_addict = cls.env.ref("base.res_partner_2")
        cls.partner_form_view = cls.env.ref("base.view_partner_simple_form")
        cls.partner_tree_view = cls.env.ref("base.view_partner_tree")
        cls.view_partner_title_form = cls.env.ref("base.view_partner_title_form")
        cls.view_partner_title_tree = cls.env.ref("base.view_partner_title_tree")
        cls.users_model = cls.env["ir.model"]._get("res.users")
        cls.view_users_form = cls.env.ref("base.view_users_form")
        cls.view_users_tree = cls.env.ref("base.view_users_tree")

        cls.company_model_id = cls.env["ir.model"]._get("res.company")
        cls.company_name_field = cls.env["ir.model.fields"].search(
            [("model", "=", "res.company"), ("name", "=", "name")]
        )
        cls.company_street_field = cls.env["ir.model.fields"].search(
            [("model", "=", "res.company"), ("name", "=", "street")]
        )
        cls.company_city_field = cls.env["ir.model.fields"].search(
            [("model", "=", "res.company"), ("name", "=", "city")]
        )
        cls.company_name_readonly = cls.env["custom.field.restriction"].create(
            {
                "readonly_model_id": cls.company_model_id.id,
                "field_id": cls.company_name_field.id,
                "group_ids": [(6, 0, cls.env.ref("base.group_user").ids)],
                "field_readonly": True,
                "condition_domain": "[('id', '>', 0)]",
            }
        )
        cls.company_street_required = cls.env["custom.field.restriction"].create(
            {
                "required_model_id": cls.company_model_id.id,
                "field_id": cls.company_street_field.id,
                "group_ids": [(6, 0, cls.env.ref("base.group_user").ids)],
                "required": True,
                "condition_domain": "[('id', '>', 0)]",
            }
        )
        cls.company_city_invisible = cls.env["custom.field.restriction"].create(
            {
                "invisible_model_id": cls.company_model_id.id,
                "field_id": cls.company_city_field.id,
                "group_ids": [(6, 0, cls.env.ref("base.group_user").ids)],
                "field_invisible": True,
                "condition_domain": "[('id', '>', 0)]",
            }
        )
        cls.company_tree_view = cls.env["ir.ui.view"].create(
            {
                "name": "Test Tree",
                "model": "res.company",
                "type": "tree",
                "mode": "primary",
                "arch": "<tree><field name='city'/>"
                "<field name='street'/>"
                "<field name='name'/></tree>",
            }
        )
        cls.view_users_form_arch_orig = cls.view_users_form.arch
        cls.view_users_form.arch = cls.view_users_form.arch.replace(
            "</notebook>",
            "</notebook><field name='company_ids'><tree><field name='city'/>"
            "<field name='street'/>"
            "<field name='name'/></tree></field>",
        )

    def test_model_form(self):
        """onchange should set correct model"""

        partner_form_view = self.view_model.default_view(
            self.partner_model_id._name, "form"
        )
        with Form(self.partner_model_id, view=partner_form_view) as partner_form:
            with partner_form.custom_required_restriction_ids.new() as new_line:
                self.assertTrue(new_line.required_model_id)
                new_line.field_id = self.partner_name_field_id
            with partner_form.custom_readonly_restriction_ids.new() as new_line:
                self.assertTrue(new_line.readonly_model_id)
                new_line.field_id = self.partner_name_field_id
            with partner_form.custom_invisible_restriction_ids.new() as new_line:
                self.assertTrue(new_line.invisible_model_id)
                new_line.field_id = self.partner_name_field_id

    def test_relational_fields(self):
        """res.users has company_ids field. It has restrictions.
        Restrictions should be added into company tree view"""
        user = self.env["res.users"].search([], limit=1)
        arch = user.fields_view_get(view_id=self.view_users_form.id, view_type="form")
        sub_arch = arch["fields"]["company_ids"]["views"]["tree"]["arch"]
        self.assertIn("x_computed_res_company_name_readonly", sub_arch)
        self.assertIn("x_computed_res_company_street_required", sub_arch)
        self.assertIn("x_computed_res_company_city_visibility", sub_arch)

    def test_all_web_field_required_invisible_manager(self):
        # related fields are created
        self.assertTrue(self.invisible_rec_id.visibility_field_id)
        self.assertTrue(self.required_rec_id.required_field_id)
        self.assertTrue(self.readonly_rec_id.readonly_field_id)
        # _compute_model_name()
        self.invisible_rec_id._compute_model_name()
        self.assertEqual(self.invisible_rec_id.model_name, "res.partner")
        self.required_rec_id._compute_model_name()
        self.assertEqual(self.required_rec_id.model_name, "res.partner")
        # fields_view_get()
        self.deco_addict.fields_view_get(
            view_id=self.partner_form_view.id, view_type="form"
        )
        self.deco_addict.fields_view_get(
            view_id=self.partner_tree_view.id, view_type="tree"
        )
        self.res_partner_title_madam.fields_view_get(
            view_id=self.view_partner_title_form.id, view_type="form"
        )
        self.res_partner_title_madam.fields_view_get(
            view_id=self.view_partner_title_tree.id, view_type="tree"
        )
        self.env.user.fields_view_get(view_id=self.view_users_form.id, view_type="form")
        self.env.user.fields_view_get(view_id=self.view_users_tree.id, view_type="tree")
        # read
        self.deco_addict.read(
            [
                "id",
                "name",
                "x_computed_res_partner_name_readonly",
                "x_computed_res_partner_name_required",
                "x_computed_res_partner_name_visibility",
            ]
        )
        self.res_partner_title_madam.read(
            ["id", "name", "x_computed_res_partner_title_shortcut_visibility"]
        )
        self.env.user.read(["id", "name"])
        self.env.user._compute_restrictions_fields()
        # computed value
        self.assertTrue(self.deco_addict.x_computed_res_partner_name_readonly)
        self.assertTrue(self.deco_addict.x_computed_res_partner_name_required)
        self.assertFalse(self.deco_addict.x_computed_res_partner_name_visibility)
        self.assertTrue(
            self.res_partner_title_madam.x_computed_res_partner_title_shortcut_visibility
        )
        # change domain, reset cache. Should be True now
        self.invisible_rec_id.condition_domain = "[('id', '>', 0)]"
        self.deco_addict.invalidate_cache()
        self.deco_addict.read(["x_computed_res_partner_name_visibility"])
        self.assertTrue(self.deco_addict.x_computed_res_partner_name_visibility)
        # default get
        self.env["res.partner"].default_get(["name"])
        self.env["res.partner"].default_get(["city"])
        self.env["res.partner.title"].default_get(["name"])
        self.env["res.partner.title"].default_get(["shortcut"])
        # onchange_field_id()
        self.assertFalse(self.invisible_title_rec_id.required)
        self.invisible_title_rec_id.field_id = self.partner_title_name_field_id
        self.invisible_title_rec_id.required_model_id = self.partner_model_id
        self.invisible_title_rec_id._compute_model_name()
        self.assertTrue(self.invisible_title_rec_id.required)
        # unlink
        self.invisible_rec_id.unlink()
        # case when child view has no fields
        self.view_users_form.arch = self.view_users_form_arch_orig
        self.view_users_form.arch = self.view_users_form.arch.replace(
            "</notebook>",
            "</notebook><field name='company_ids'><form><br/></form></field>",
        )
        self.env.user.fields_view_get(view_id=self.view_users_form.id, view_type="form")
        self.env.user.fields_view_get(view_id=self.view_users_tree.id, view_type="tree")

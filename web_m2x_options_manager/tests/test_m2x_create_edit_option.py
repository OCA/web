# Copyright 2021 Camptocamp SA
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

from lxml import etree

from odoo.exceptions import ValidationError

from .common import Common


class TestM2xCreateEditOption(Common):
    def test_errors(self):
        with self.assertRaises(ValidationError):
            # Fails ``_check_field_type``: users_field is a One2many
            self._create_opt("res.partner", "user_ids")

    def test_apply_options(self):
        # Check fields on res.partner form view before applying options
        form_doc = self._get_test_view_parsed()
        self.assertEqual(
            self._eval_node_options(form_doc.xpath("//field[@name='title']")[0]), {}
        )
        self.assertEqual(
            self._eval_node_options(form_doc.xpath("//field[@name='parent_id']")[0]),
            {"create": False, "create_edit": False},
        )
        self.assertEqual(
            self._eval_node_options(form_doc.xpath("//field[@name='category_id']")[0]),
            {"create": False, "create_edit": False},
        )

        # Create options, check view has been updated
        self._create_opt(
            "res.partner",
            "title",
            {
                "option_create": "set_true",
                "option_create_edit": "set_true",
            },
        )
        self._create_opt(
            "res.partner",
            "parent_id",
            {
                "option_create": "set_true",
                "option_create_edit": "set_true",
            },
        )
        self._create_opt(
            "res.partner",
            "category_id",
            {
                "option_create": "force_true",
                "option_create_edit": "force_true",
            },
        )
        form_doc = self._get_test_view_parsed()
        self.assertEqual(
            self._eval_node_options(form_doc.xpath("//field[@name='title']")[0]),
            {"create": True, "create_edit": True},
        )
        self.assertEqual(
            self._eval_node_options(form_doc.xpath("//field[@name='parent_id']")[0]),
            # These remain the same because the options are defined w/ 'set_true':
            # but the node already contains them, so no override is applied
            {"create": False, "create_edit": False},
        )
        self.assertEqual(
            self._eval_node_options(form_doc.xpath("//field[@name='category_id']")[0]),
            # These change values because the options are defined w/ 'force_true':
            # options' values are overridden even if the node already contains them
            {"create": True, "create_edit": True},
        )

        # Update options on ``res.partner.parent_id``, check its node has been updated
        opt = self.env["m2x.create.edit.option"].get("res.partner", "parent_id")
        opt.option_create = "force_true"
        opt.option_create_edit = "force_true"
        form_doc = self._get_test_view_parsed()
        self.assertEqual(
            self._eval_node_options(form_doc.xpath("//field[@name='parent_id']")[0]),
            {"create": True, "create_edit": True},
        )

    def test_apply_options_lowercase_booleans(self):
        # options written like in JS, as in some views of Odoo itself
        view = self.env["ir.ui.view"].create(
            {
                "name": "res.partner.lowercase.options",
                "model": "res.partner",
                "priority": 1000,
                "arch": """
                    <form>
                        <field name="parent_id" options="{'create': false}" />
                    </form>
                """,
            }
        )
        self._create_opt("res.partner", "parent_id", {"option_create_edit": "set_true"})
        arch = self.env["res.partner"].get_view(view.id)["arch"]
        node = etree.XML(arch).xpath("//field[@name='parent_id']")[0]
        self.assertEqual(
            self._eval_node_options(node), {"create": False, "create_edit": True}
        )

    def test_m2x_option_name(self):
        # Mostly to make Codecov happy...
        opt = self._create_opt(
            "res.partner",
            "title",
            {
                "option_create": "set_true",
                "option_create_edit": "set_true",
            },
        )
        self.assertEqual(opt.name, "res.partner.title")
        opt = opt.new({"field_id": self._get_field("res.partner", "parent_id").id})
        self.assertEqual(opt.name, "res.partner.parent_id")

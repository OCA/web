# Copyright 2023 Numigi (tm) and all its contributors (https://bit.ly/numigiens)
# License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl).

import json

from lxml import etree

from odoo.tests import common


def _extract_modifier_value(el, modifier):
    return json.loads(el.attrib.get("modifiers") or "{}").get(modifier)


class TestViewRendering(common.SavepointCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.view = cls.env.ref("base.view_partner_form")
        cls.email_modifier = cls.env["web.custom.modifier"].create(
            {
                "model_ids": [(4, cls.env.ref("base.model_res_partner").id)],
                "type_": "field",
                "reference": "email",
                "modifier": "invisible",
            }
        )

        cls.xpath = "//field[@name='street']"
        cls.street_modifier = cls.env["web.custom.modifier"].create(
            {
                "model_ids": [(4, cls.env.ref("base.model_res_partner").id)],
                "type_": "xpath",
                "reference": cls.xpath,
                "modifier": "invisible",
            }
        )

        cls.hidden_option = "other"
        cls.env["web.custom.modifier"].create(
            {
                "model_ids": [(4, cls.env.ref("base.model_res_partner").id)],
                "type_": "field",
                "reference": "type",
                "modifier": "selection_hide",
                "key": cls.hidden_option,
            }
        )

        cls.env["web.custom.modifier"].create(
            {
                "model_ids": [(4, cls.env.ref("base.model_res_partner").id)],
                "type_": "field",
                "reference": "parent_id",
                "modifier": "widget",
                "key": "custom_widget",
            }
        )

        cls.env["web.custom.modifier"].create(
            {
                "model_ids": [(4, cls.env.ref("base.model_ir_model").id)],
                "type_": "xpath",
                "reference": "//field[@name='field_id']//tree",
                "modifier": "limit",
                "key": "20",
            }
        )

        cls.env["web.custom.modifier"].create(
            {
                "model_ids": [(4, cls.env.ref("base.model_res_partner").id)],
                "type_": "field",
                "reference": "name",
                "modifier": "optional",
                "key": "show",
            }
        )

    def _get_rendered_view_tree(self):
        arch = self.env["res.partner"].fields_view_get(view_id=self.view.id)["arch"]
        return etree.fromstring(arch)

    def test_field_modifier(self, modifier="invisible"):
        self.email_modifier.modifier = modifier
        tree = self._get_rendered_view_tree()
        el = tree.xpath("//field[@name='email']")[0]
        self.assertTrue(_extract_modifier_value(el, modifier))

    def test_field_force_save(self):
        self.email_modifier.modifier = "force_save"
        tree = self._get_rendered_view_tree()
        el = tree.xpath("//field[@name='email']")[0]
        self.assertEqual(el.attrib["force_save"], "1")

    def test_two_modifier_same_field(self):
        self.email_modifier.modifier = "invisible"
        self.email_modifier.copy().modifier = "readonly"
        self.email_modifier.copy().modifier = "column_invisible"
        tree = self._get_rendered_view_tree()
        el = tree.xpath("//field[@name='email']")[0]
        self.assertTrue(_extract_modifier_value(el, "column_invisible"))
        self.assertTrue(_extract_modifier_value(el, "readonly"))
        self.assertTrue(_extract_modifier_value(el, "invisible"))

    def test_xpath_modifier(self, modifier="invisible"):
        self.street_modifier.modifier = modifier
        tree = self._get_rendered_view_tree()
        el = tree.xpath("//field[@name='street']")[0]
        self.assertTrue(_extract_modifier_value(el, modifier))

    def test_user_in_excluded_groups(self):
        modifier = "invisible"
        group = self.env.ref("base.group_system")
        self.street_modifier.modifier = modifier
        self.street_modifier.excluded_group_ids = group
        self.env.user.groups_id |= group
        tree = self._get_rendered_view_tree()
        el = tree.xpath("//field[@name='street']")[0]
        self.assertFalse(_extract_modifier_value(el, modifier))

    def test_user_not_in_excluded_groups(self):
        modifier = "invisible"
        group = self.env.ref("base.group_system")
        self.street_modifier.modifier = modifier
        self.street_modifier.excluded_group_ids = group
        self.env.user.groups_id -= group
        tree = self._get_rendered_view_tree()
        el = tree.xpath("//field[@name='street']")[0]
        self.assertTrue(_extract_modifier_value(el, modifier))

    def test_selection_hide__fields_view_get(self):
        fields = self.env["res.partner"].fields_view_get(view_id=self.view.id)["fields"]
        options = {i[0]: i[1] for i in fields["type"]["selection"]}
        self.assertNotIn(self.hidden_option, options)

    def test_selection_hide__fields_get(self):
        fields = self.env["res.partner"].fields_get()
        options = {i[0]: i[1] for i in fields["type"]["selection"]}
        self.assertNotIn(self.hidden_option, options)

    def test_widget(self):
        tree = self._get_rendered_view_tree()
        el = tree.xpath("//field[@name='parent_id']")[0]
        self.assertEqual(el.attrib.get("widget"), "custom_widget")

    def test_optional(self):
        tree = self._get_rendered_view_tree()
        el = tree.xpath("//field[@name='name']")[0]
        self.assertEqual(el.attrib.get("optional"), "show")

    def test_nbr_line_per_page(self):
        model_view = self.env.ref("base.view_model_form")
        arch = self.env["ir.model"].fields_view_get(view_id=model_view.id)["fields"][
            "field_id"
        ]["views"]["tree"]["arch"]
        tree = etree.fromstring(arch)
        el = tree.xpath("//tree")[0]
        self.assertEqual(el.attrib.get("limit"), "20")

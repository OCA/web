# Copyright (C) 2023 - Today: GRAP (http://www.grap.coop)
# @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from odoo.exceptions import ValidationError
from odoo.tests import common


class Test(common.TransactionCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.res_groups_view = cls.env.ref("base.view_groups_form")
        cls.ResGroups = cls.env["res.groups"]
        cls.MergeSetting = cls.env["ir.ui.view.merge.notebook.tab"]

    def _create_setting(self):
        return self.MergeSetting.create(
            {
                "view_xml_id": self.res_groups_view.xml_id,
                "tab_description": "Menus and Views",
                "tab_name": "menus_and_views",
                "merge_tab_names": "menus,views",
            }
        )

    def test_merge_tabs(self):
        arch, view = self.ResGroups._get_view(view_id=self.res_groups_view.id)
        self.assertTrue(arch.xpath("//page[@name='menus']"))
        self.assertTrue(arch.xpath("//page[@name='views']"))
        self.assertFalse(arch.xpath("//page[@name='menus_and_views']"))

        setting = self._create_setting()
        arch, view = self.ResGroups._get_view(view_id=self.res_groups_view.id)
        self.assertFalse(arch.xpath("//page[@name='menus']"))
        self.assertFalse(arch.xpath("//page[@name='views']"))
        self.assertTrue(arch.xpath("//page[@name='menus_and_views']"))

        setting.write({"merge_tab_names": "menus,bad_tab_name"})
        arch, view = self.ResGroups._get_view(view_id=self.res_groups_view.id)
        self.assertFalse(arch.xpath("//page[@name='menus']"))
        self.assertTrue(arch.xpath("//page[@name='views']"))
        self.assertTrue(arch.xpath("//page[@name='menus_and_views']"))

        setting.unlink()
        arch, view = self.ResGroups._get_view(view_id=self.res_groups_view.id)
        self.assertTrue(arch.xpath("//page[@name='menus']"))
        self.assertTrue(arch.xpath("//page[@name='views']"))
        self.assertFalse(arch.xpath("//page[@name='menus_and_views']"))

    def test_constrains(self):
        setting = self._create_setting()
        with self.assertRaises(ValidationError):
            setting.view_xml_id = "bad xml id"

        with self.assertRaises(ValidationError):
            setting.tab_name = "tab name with spaces"

        with self.assertRaises(ValidationError):
            setting.merge_tab_names = "[,bad list"

    def test_compute(self):
        setting = self._create_setting()
        self.assertEqual(setting.view_id, self.res_groups_view)

        setting.view_xml_id = "inexisting.xml_id"
        self.assertFalse(setting.view_id)

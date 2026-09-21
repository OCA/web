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
        cls.res_groups_model = cls.env.ref("base.model_res_groups")
        cls.MergeSetting = cls.env["ir.ui.view.merge.notebook.tab"]

    def _create_setting(self, extra_vals=False):
        vals = {
            "view_id": self.res_groups_view.id,
            "model_id": self.res_groups_model.id,
            "tab_string": "Menus and Views",
            "merge_tab_names": "menus,views",
        }
        if extra_vals:
            vals.update(extra_vals)
        return self.MergeSetting.create(vals)

    def test_merge_tabs(self):
        arch, view = self.env["base"]._get_view(view_id=self.res_groups_view.id)
        self.assertTrue(arch.xpath("//page[@name='menus']"))
        self.assertTrue(arch.xpath("//page[@name='views']"))
        self.assertFalse(arch.xpath("//page[@name='menus_and_views']"))

        setting = self._create_setting({"tab_name": "menus_and_views"})
        arch, view = self.env["base"]._get_view(view_id=self.res_groups_view.id)
        self.assertFalse(arch.xpath("//page[@name='menus']"))
        self.assertFalse(arch.xpath("//page[@name='views']"))
        self.assertTrue(arch.xpath("//page[@name='menus_and_views']"))

        setting.unlink()
        arch, view = self.env["base"]._get_view(view_id=self.res_groups_view.id)
        self.assertTrue(arch.xpath("//page[@name='menus']"))
        self.assertTrue(arch.xpath("//page[@name='views']"))
        self.assertFalse(arch.xpath("//page[@name='menus_and_views']"))

    def test_constrains(self):
        setting = self._create_setting()

        with self.assertRaises(ValidationError):
            setting.tab_name = "tab name with spaces"

        with self.assertRaises(ValidationError):
            setting.merge_tab_names = "[,bad list"

        with self.assertRaises(ValidationError):
            setting.merge_tab_names = "menus,views,+"

        with self.assertRaises(ValidationError):
            setting.tab_name_position = "tab doesnt exist"

    def test_compute(self):
        setting = self._create_setting()
        self.assertEqual(setting.tab_name, f"tab_base_view_groups_form_{setting.id}")
        for _tab_name in ["menus", "views"]:
            self.assertIn(_tab_name, setting.tab_names_available.split(","))

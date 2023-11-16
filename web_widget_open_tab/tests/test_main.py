from odoo.tests import common


class Test(common.TransactionCase):
    def test_add_open_tab_field(self):
        self.env["ir.model"]._get("res.company").add_open_tab_field = True
        arch, view = self.env["res.company"]._get_view(view_id=None, view_type="tree")
        found = arch.xpath("//field[@widget='open_tab']")
        self.assertEqual(len(found), 1)

    def test_no_add_open_tab_field(self):
        self.env["ir.model"]._get("res.company").add_open_tab_field = False
        arch, view = self.env["res.company"]._get_view(view_id=None, view_type="tree")
        found = arch.xpath("//field[@widget='open_tab']")
        self.assertFalse(found)

    def test_add_open_tab_field_no_name_field(self):
        self.env["ir.model"]._get("res.groups").add_open_tab_field = True
        arch, view = self.env["res.groups"]._get_view(view_id=None, view_type="tree")
        found = arch.xpath("//field[@widget='open_tab']")
        self.assertEqual(len(found), 1)

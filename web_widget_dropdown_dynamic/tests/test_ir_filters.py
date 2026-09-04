# Copyright 2026 Idris <idris@domatix.com>
# License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl.html).

from odoo.tests import common


class TestIrFiltersDemoMethod(common.TransactionCase):
    def _call_demo(self, depending_on):
        return (
            self.env["ir.filters"]
            .with_context(depending_on=depending_on)
            .dynamic_dropdown_int_method_demo()
        )

    def test_demo_method_single_matching_id(self):
        admin_id = self.env.ref("base.user_admin").id
        values = self._call_demo(admin_id)
        self.assertIn(("2", "Two"), values)

    def test_demo_method_single_non_matching_id(self):
        values = self._call_demo(-1)
        self.assertEqual(values, [("1", "One")])

    def test_demo_method_list_with_matching_id(self):
        admin_id = self.env.ref("base.user_admin").id
        values = self._call_demo([admin_id])
        self.assertIn(("2", "Two"), values)

    def test_demo_method_list_without_matching_id(self):
        values = self._call_demo([-1])
        self.assertEqual(values, [("1", "One")])

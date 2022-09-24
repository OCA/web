# Copyright 2019 Creu Blanca
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

from odoo.tests.common import TransactionCase


class TestWidgetChildSelector(TransactionCase):
    def setUp(self):
        super().setUp()
        ResPartner = self.env["res.partner"].with_context(tracking_disable=True)
        self.partner_1 = ResPartner.create({"name": "P1"})
        self.partner_2 = ResPartner.create(
            {"name": "P2", "parent_id": self.partner_1.id}
        )
        self.partner_3 = ResPartner.create(
            {"name": "P3", "parent_id": self.partner_2.id}
        )
        # Model that doesnt have the parent/child structure
        self.group = self.env["res.groups"].create({"name": "Group"})

    def test_widget_child_selector(self):
        res = self.partner_2.get_record_direct_childs_parents(
            {"child_selection_field": "name"}
        )
        self.assertIn((self.partner_1.id, self.partner_1.name), res["parents"])
        self.assertIn((self.partner_3.id, self.partner_3.name), res["childs"])
        res = self.group.get_record_direct_childs_parents({})
        self.assertFalse(res["parents"])
        self.assertFalse(res["childs"])

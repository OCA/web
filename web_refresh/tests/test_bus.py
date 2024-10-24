# Copyright 2021 Sergey Shebanin
# License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl.html).
from collections import defaultdict

from odoo import SUPERUSER_ID
from odoo.tests.common import TransactionCase, tagged


@tagged("post_install", "-at_install")
class TestBusBus(TransactionCase):
    def setUp(self):
        super().setUp()
        self.env.registry.get_modified_records(defaultdict(set))

    def test_10_watch_disabled(self):
        self.assertFalse(self.env.user.has_group("web_refresh.group_watch_changes"))

    def test_20_watch_enabled(self):
        self.env.ref("base.group_user").implied_ids = (
            4,
            self.env.ref("web_refresh.group_watch_changes").id,
        )
        self.assertTrue(self.env.user.has_group("web_refresh.group_watch_changes"))
        self.assertTrue(
            self.env["res.users"]
            .browse(SUPERUSER_ID)
            .has_group("web_refresh.group_watch_changes")
        )

    def test_30_create(self):
        self.env.ref("base.group_user").implied_ids = (
            4,
            self.env.ref("web_refresh.group_watch_changes").id,
        )
        self.env["res.partner"].create(
            {
                "name": "Test",
            }
        )
        self.assertEqual(
            {0}, self.env.registry.get_modified_records().get("res.partner")
        )

    def test_40_write_simple(self):
        self.env.ref("base.group_user").implied_ids = (
            4,
            self.env.ref("web_refresh.group_watch_changes").id,
        )
        partner = self.env["res.partner"].create(
            {
                "name": "Test1",
            }
        )
        partner.name = "Test2"
        partner.flush()
        self.assertEqual(
            {0, partner.id}, self.env.registry.get_modified_records().get("res.partner")
        )

    def test_50_write_dependency(self):
        self.env.ref("base.group_user").implied_ids = (
            4,
            self.env.ref("web_refresh.group_watch_changes").id,
        )
        partner1 = self.env["res.partner"].create(
            {
                "name": "Parent",
            }
        )
        partner2 = self.env["res.partner"].create(
            {
                "name": "Child",
                "parent_id": partner1.id,
            }
        )
        partner1.is_company = True
        partner1.flush()
        self.assertEqual(
            {0, partner1.id, partner2.id},
            self.env.registry.get_modified_records().get("res.partner"),
        )

    def test_60_signal_changes(self):
        self.env.ref("base.group_user").implied_ids = (
            4,
            self.env.ref("web_refresh.group_watch_changes").id,
        )
        partner = self.env["res.partner"].create(
            {
                "name": "Test",
            }
        )
        partner.flush()
        self.env.registry.signal_changes()
        # Partner changes committed and bus.bus was created in another cursor
        self.assertEqual({"bus.bus": {0}}, self.env.registry.get_modified_records())

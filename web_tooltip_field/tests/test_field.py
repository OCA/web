# Copyright 2023 Komit - Cuong Nguyen Mtm
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

from odoo.tests import common


class TestField(common.SavepointCase):
    @classmethod
    def setUpClass(cls):
        super(TestField, cls).setUpClass()

    def test_field_description_help(self):
        contact_user_id_field = self.env["res.partner"]._fields["user_id"]
        self.assertEqual(
            contact_user_id_field._description_help(self.env),
            "The internal user in charge of this contact.",
        )
        contact_user_id_field_rec = self.env["ir.model.fields"].search(
            [
                ("model", "=", "res.partner"),
                ("name", "=", "user_id"),
            ],
            limit=1,
        )
        self.env["ir.model.fields.help.tooltip"].create(
            {"field_id": contact_user_id_field_rec.id, "help": "This is a test help."}
        )
        self.assertEqual(
            contact_user_id_field._description_help(self.env), "This is a test help."
        )

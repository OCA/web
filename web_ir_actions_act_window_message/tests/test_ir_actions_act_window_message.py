# Copyright 2025 Studio73 - Eugenio Micó <eugenio@studio73.es>
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl.html).

from odoo.addons.base.tests.common import BaseCommon


class TestIrActionsActWindowMessage(BaseCommon):
    def test_get_readable_fields(self):
        action = self.env["ir.actions.act_window.message"].create(
            {
                "name": "Test Action",
            }
        )
        readable_fields = action._get_readable_fields()
        for field in [
            "title",
            "buttons",
            "close_button_title",
            "message",
            "is_html_message",
        ]:
            self.assertIn(field, readable_fields)

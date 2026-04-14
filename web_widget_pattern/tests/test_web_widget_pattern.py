# Copyright 2024 Hunki Enterprises BV
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl-3.0)

from odoo.tests.common import HttpCase, TransactionCase, tagged


class TestWebWidgetPattern(TransactionCase):
    def test_fields_get(self):
        ResPartner = self.env["res.partner"]
        ResPartner._fields["street2"].pattern = "[0-9]"
        field_description = ResPartner.get_views(
            [(self.env.ref("base.view_partner_form").id, "form")]
        )["models"]["res.partner"]["fields"]["street2"]
        self.assertEqual(field_description["pattern"], "[0-9]")


@tagged("post_install", "-at_install")
class TestWebWidgetPatternHoot(HttpCase):
    def test_js(self):
        self.browser_js(
            "/web/tests?headless&loglevel=2&preset=desktop&filter=WebWidgetPattern",
            "",
            "",
            login="admin",
            success_signal="[HOOT] Test suite succeeded",
            error_checker=lambda x: "[HOOT]" not in x,
        )

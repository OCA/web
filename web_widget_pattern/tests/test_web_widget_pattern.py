# Copyright 2024 Hunki Enterprises BV
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl-3.0)

import odoo
from odoo.tests.common import TransactionCase

from odoo.addons.web.tests.test_js import WebSuite


class TestWebWidgetPattern(TransactionCase):
    def test_fields_get(self):
        ResPartner = self.env["res.partner"]
        ResPartner._fields["street2"].pattern = "[0-9]"
        field_description = ResPartner.get_views(
            [(self.env.ref("base.view_partner_form").id, "form")]
        )["models"]["res.partner"]["fields"]["street2"]
        self.assertEqual(field_description["pattern"], "[0-9]")


@odoo.tests.tagged("post_install", "-at_install")
class TestWebWidgetPatternHoot(WebSuite):
    def get_hoot_filters(self):
        self._test_params = [("+", "@web_widget_pattern")]
        return super().get_hoot_filters()

    def test_web_widget_pattern(self):
        self.test_unit_desktop()

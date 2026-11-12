# Copyright 2026 Heligrafics Fotogrametria S.L.
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

from odoo.tests import HttpCase, tagged


@tagged("-at_install", "post_install")
class TestDateRangeListJS(HttpCase):
    def test_js_unit(self):
        self.browser_js(
            "/web/tests?filter=web_list_date_range_required",
            "",
            "",
            login="admin",
            timeout=1800,
        )

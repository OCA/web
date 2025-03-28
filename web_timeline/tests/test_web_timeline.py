# Copyright 2024 Tecnativa - Carlos Lopez
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
from odoo.tests import tagged
from odoo.tests.common import HttpCase


@tagged("post_install", "-at_install")
class TestWebTimeline(HttpCase):
    def test_timeline_arch(self):
        self.browser_js(
            "/web/tests/legacy?mod=web&filter=TimelineView - ArchParser",
            "",
            login="admin",
            timeout=1800,
            success_signal="QUnit test suite done.",
        )

    def test_timeline_view(self):
        self.browser_js(
            "/web/tests/legacy?mod=web&filter=TimelineView - View",
            "",
            login="admin",
            timeout=1800,
            success_signal="QUnit test suite done.",
        )

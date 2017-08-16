# -*- coding: utf-8 -*-
# Copyright 2017 LasLabs Inc.
# License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl).

from odoo.tests.common import HttpCase


class UICase(HttpCase):
    def test_ui_web(self):
        """Test backend tests."""
        self.phantom_js(
            "/web/tests?debug=assets&module=web_widget_slickroom",
            "",
            login="admin",
        )

# -*- coding: utf-8 -*-
# Copyright (c) 2017 Simone Orsi <simone.orsi@camptocamp.com>
# License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl.html).

from odoo.tests import HttpCase


class TestUi(HttpCase):

    def test_ui_web(self):
        self.phantom_js(
            "/web/tests?module=web_readonly_bypass",
            "",
            login="admin",
        )

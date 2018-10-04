# -*- coding: utf-8 -*-
# Copyright 2018 Simone Rubino - Agile Business Group
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from odoo.tests import HttpCase


class TestJS(HttpCase):

    def test_js(self):
        self.phantom_js(
            "/web/tests?module=web_widget_char_switchcase",
            "",
            login="admin"
        )

# -*- coding: utf-8 -*-
# Copyright 2016 LasLabs Inc.
# License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl.html).

from openerp.tests import HttpCase


class TestJS(HttpCase):

    def test_js(self):
        self.phantom_js(
            "/web/tests?module=web_widget_float_formula",
            "",
            login="admin",
        )

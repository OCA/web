# -*- coding: utf-8 -*-
# Copyright 2016 LasLabs Inc.
# License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl.html).

import odoo.tests


class TestJS(odoo.tests.HttpCase):

    def test_js(self):
        self.phantom_js(
            "/web/tests?module=web_widget_float_formula",
            "console.log('ok')",
            "",
            login="admin"
        )

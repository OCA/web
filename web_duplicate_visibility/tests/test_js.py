# -*- coding: utf-8 -*-
# Copyright 2016 Jairo Llopis <jairo.llopis@tecnativa.com>
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

from openerp.tests import HttpCase


class TestJS(HttpCase):
    def test_js(self):
        self.phantom_js(
            "/web/tests?module=web_duplicate_visibility",
            "",
            login="admin",
        )

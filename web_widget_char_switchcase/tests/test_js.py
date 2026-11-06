# Copyright 2018 Simone Rubino - Agile Business Group
# Copyright 2024 Alexadre Díaz - Grupo Isonor
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from odoo.tests import HttpCase


class TestJS(HttpCase):
    def test_js(self):
        self.browser_js(
            "/web/tests?module=web_widget_char_switchcase&failfast",
            "",
            "",
            login="admin",
            timeout=1800,
        )

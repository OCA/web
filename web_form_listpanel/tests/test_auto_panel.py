# Copyright 2026 Roberto Fichera
# License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl.html).

from odoo.tests import HttpCase, tagged

PARAM = "web_form_listpanel.auto_panel"
KEY = "web_form_listpanel_auto_panel"


@tagged("post_install", "-at_install")
class TestAutoPanelSetting(HttpCase):
    def _session_value(self):
        self.authenticate("admin", "admin")
        return self.make_jsonrpc_request("/web/session/get_session_info")[KEY]

    def test_session_info_off(self):
        self.env["ir.config_parameter"].set_param(PARAM, False)
        self.assertIs(self._session_value(), False)

    def test_session_info_on(self):
        self.env["ir.config_parameter"].set_param(PARAM, "True")
        self.assertIs(self._session_value(), True)

    def test_settings_field(self):
        self.env["res.config.settings"].create({"listpanel_auto_panel": True}).execute()
        self.assertTrue(self.env["ir.config_parameter"].get_param(PARAM))

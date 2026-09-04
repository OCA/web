from odoo.tests import tagged

from odoo.addons.base.tests.common import HttpCaseWithUserDemo


@tagged("-at_install", "post_install")
class TestGetTimeoutController(HttpCaseWithUserDemo):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.session = cls.authenticate(cls, "demo", "demo")

    def setUp(self):
        super().setUp()
        self.opener.cookies["session_id"] = self.session.sid

    def test_get_timeout_returns_ms(self):
        self.env["ir.config_parameter"].sudo().set_param(
            "web_session_auto_close.timeout", 123
        )
        timeout = self.make_jsonrpc_request("/web/session/get_timeout", {})
        self.assertEqual(timeout, 123 * 1000)

    def test_get_timeout_default_when_invalid_value(self):
        self.env["ir.config_parameter"].sudo().set_param(
            "web_session_auto_close.timeout", "invalid"
        )
        timeout = self.make_jsonrpc_request("/web/session/get_timeout", {})
        self.assertEqual(timeout, 600 * 1000)

    def test_get_timeout_default_when_float_string(self):
        self.env["ir.config_parameter"].sudo().set_param(
            "web_session_auto_close.timeout", "12.5"
        )
        timeout = self.make_jsonrpc_request("/web/session/get_timeout", {})
        self.assertEqual(timeout, 600 * 1000)

    def test_get_timeout_zero(self):
        self.env["ir.config_parameter"].sudo().set_param(
            "web_session_auto_close.timeout", 0
        )
        timeout = self.make_jsonrpc_request("/web/session/get_timeout", {})
        self.assertEqual(timeout, 0)

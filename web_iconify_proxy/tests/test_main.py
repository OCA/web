import base64
from unittest.mock import patch

import requests

from odoo.tests import tagged
from odoo.tests.common import HttpCase


@tagged("post_install", "-at_install")
class TestIconifyProxyController(HttpCase):
    @patch("odoo.addons.web_iconify_proxy.controllers.main.requests.get")
    def test_get_svg_success(self, mock_get):
        mock_response = requests.Response()
        mock_response.status_code = 200
        mock_response._content = b"<svg>dummy content</svg>"
        mock_response.headers["Content-Type"] = "image/svg+xml"
        mock_get.return_value = mock_response

        response = self.url_open("/web_iconify_proxy/mdi/home.svg")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.headers["Content-Type"], "image/svg+xml")
        # Add basic check for SVG content (can be improved)
        self.assertTrue(b"<svg" in response.content)

    @patch("odoo.addons.web_iconify_proxy.controllers.main.requests.get")
    def test_get_css_success(self, mock_get):
        mock_response = requests.Response()
        mock_response.status_code = 200
        mock_response._content = b".iconify { color: red; }"
        mock_response.headers["Content-Type"] = "text/css"
        mock_get.return_value = mock_response

        response = self.url_open("/web_iconify_proxy/mdi.css?icons=home,account")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.headers["Content-Type"], "text/css")
        # Add basic check for CSS content
        self.assertTrue(b".iconify" in response.content)

    @patch("odoo.addons.web_iconify_proxy.controllers.main.requests.get")
    def test_get_json_success(self, mock_get):
        mock_response = requests.Response()
        mock_response.status_code = 200
        mock_response._content = b'{"prefix": "mdi", "icons": {"home": {}}}'
        mock_response.headers["Content-Type"] = "application/json"
        mock_get.return_value = mock_response

        response = self.url_open("/web_iconify_proxy/mdi.json?icons=home,account")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.headers["Content-Type"], "application/json")
        # Add basic check for JSON content (can be improved)
        self.assertTrue(b'{"prefix":' in response.content)

    def test_get_svg_invalid_prefix(self):
        response = self.url_open("/web_iconify_proxy/invalid!prefix/home.svg")
        self.assertEqual(response.status_code, 404)

    def test_get_svg_invalid_icon(self):
        response = self.url_open("/web_iconify_proxy/mdi/invalid!icon.svg")
        self.assertEqual(response.status_code, 404)

    def test_get_css_invalid_icons(self):
        response = self.url_open("/web_iconify_proxy/mdi.css?icons=home,invalid!icon")
        self.assertEqual(response.status_code, 404)

    def test_get_json_invalid_icons(self):
        response = self.url_open("/web_iconify_proxy/mdi.json?icons=home,invalid!icon")
        self.assertEqual(response.status_code, 404)

    def test_get_last_modified(self):
        # Create a dummy attachment
        attachment = (
            self.env["ir.attachment"]
            .sudo()
            .create(
                {
                    "name": "mdi-test",
                    "datas": base64.b64encode(b"dummy data").decode("utf-8"),
                    "res_model": "iconify.svg",
                    "res_id": 0,
                    "type": "binary",
                }
            )
        )

        response = self.url_open("/web_iconify_proxy/last-modified?prefixes=mdi")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.headers["Content-Type"], "application/json")
        # Check if the response is a valid timestamp
        try:
            float(response.content)
        except ValueError:
            self.fail("last-modified did not return a valid timestamp")

        # Clean up the attachment
        attachment.unlink()

    def test_get_last_modified_no_prefix(self):
        response = self.url_open("/web_iconify_proxy/last-modified")
        self.assertEqual(response.status_code, 404)

    def test_get_css_no_icons(self):
        response = self.url_open("/web_iconify_proxy/mdi.css")
        self.assertEqual(response.status_code, 404)

    def test_get_json_no_icons(self):
        response = self.url_open("/web_iconify_proxy/mdi.json")
        self.assertEqual(response.status_code, 404)

    @patch("odoo.addons.web_iconify_proxy.controllers.main.requests.get")
    def test_caching(self, mock_get):
        # Mock the requests.get method to return a dummy response
        mock_response = requests.Response()
        mock_response.status_code = 200
        mock_response._content = b"<svg>dummy content</svg>"
        mock_response.headers["Content-Type"] = "image/svg+xml"
        mock_get.return_value = mock_response

        # First request, should fetch from API
        response1 = self.url_open("/web_iconify_proxy/mdi/home.svg")
        self.assertEqual(response1.status_code, 200)
        self.assertFalse("X-Cached-At" in response1.headers)  # Check that is NOT cached

        # Second request, should be served from cache
        response2 = self.url_open("/web_iconify_proxy/mdi/home.svg")
        self.assertEqual(response2.status_code, 200)
        self.assertTrue("X-Cached-At" in response2.headers)  # Check that IS cached

        # Check that content is the same
        self.assertEqual(response1.content, response2.content)

    @patch("odoo.addons.web_iconify_proxy.controllers.main.requests.get")
    def test_api_error(self, mock_get):
        # Mock requests.get to simulate an API error
        mock_get.side_effect = requests.exceptions.RequestException("Simulated Error")
        with self.assertLogs(level="ERROR") as log:
            response = self.url_open("/web_iconify_proxy/mdi/home.svg")
            self.assertEqual(response.status_code, 404)  # Expect 404 Not Found
            self.assertIn("Simulated Error", log.output[0])

# Copyright 2024 Tecnativa - Víctor Martínez
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

from odoo.tests.common import tagged

from odoo.addons.base.tests.common import HttpCaseWithUserDemo


@tagged("-at_install", "post_install")
class TestWebPwaCustomize(HttpCaseWithUserDemo):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        icp = cls.env["ir.config_parameter"].sudo()
        icp.set_param("pwa.manifest.short_name", "SHORT-NAME")
        icp.set_param("pwa.manifest.background_color", "#2E69B5")
        icp.set_param("pwa.manifest.theme_color", "#2E69B4")

    def test_webmanifest_customize(self):
        response = self.url_open("/web/manifest.webmanifest")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.headers["Content-Type"], "application/manifest+json")
        data = response.json()
        self.assertEqual(data["short_name"], "SHORT-NAME")
        self.assertEqual(data["background_color"], "#2E69B5")
        self.assertEqual(data["theme_color"], "#2E69B4")

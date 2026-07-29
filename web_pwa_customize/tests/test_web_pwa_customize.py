# Copyright 2024 Tecnativa - Víctor Martínez
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

from odoo.tests.common import Form, tagged

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

    def test_default_get_pwa_icon_singleton(self):
        """Test default_get doesn't crash with multiple PWA icon attachments.

        Reproduces the real scenario: duplicate attachments with the same URL
        accumulate due to race conditions or repeated saves. The search in
        get_values() matches all of them, and .datas triggers ensure_one().
        """
        attachment_model = self.env["ir.attachment"].sudo()
        # Simulate production scenario: 2 attachments with the same URL
        # (the actual bug — duplicate base icon)
        for _ in range(2):
            attachment_model.create(
                {
                    "name": "/web_pwa_customize/icon.svg",
                    "url": "/web_pwa_customize/icon.svg",
                    "type": "binary",
                    "datas": "dGVzdA==",
                    "mimetype": "image/svg+xml",
                }
            )
        # Also create resized PNG variants (normal scenario)
        for size in ["128x128", "144x144", "152x152"]:
            attachment_model.create(
                {
                    "name": f"/web_pwa_customize/icon{size}.png",
                    "url": f"/web_pwa_customize/icon{size}.png",
                    "type": "binary",
                    "datas": "dGVzdA==",
                    "mimetype": "image/png",
                }
            )
        # Form() triggers default_get() which calls get_values() via super chain
        # This is the exact flow that crashes in production
        settings_form = Form(self.env["res.config.settings"])
        # If the bug exists, this line raises:
        # ValueError: Expected singleton: ir.attachment(137, 123)
        settings_form.save()

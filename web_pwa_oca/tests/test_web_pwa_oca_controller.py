# Copyright 2020 João Marques
# License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl.html).

import base64
import json

import odoo.tests
from odoo import exceptions
from odoo.modules.module import get_resource_path


class TestUi(odoo.tests.HttpCase):
    def setUp(self):
        super().setUp()
        self.user = self.env.ref("base.user_admin")
        self.res_config_settings_obj = (
            self.env["res.config.settings"].sudo(self.user.id).create({})
        )

    def test_manifest_valid_json(self):
        # Call the manifest controller
        manifest_data = self.url_open("/web_pwa_oca/manifest.webmanifest")
        # should be valid json
        manifest_content_str = manifest_data.content.decode("utf-8")
        json.loads(manifest_content_str)

    def test_manifest_correct_paramenters(self):
        # Set PWA parameters in settings
        self.res_config_settings_obj.pwa_name = "Test PWA"
        self.res_config_settings_obj.pwa_short_name = "Test"
        # icon should remain the default one
        self.res_config_settings_obj.pwa_icon = False
        self.res_config_settings_obj.set_values()

        # Call the manifest controller
        manifest_data = self.url_open("/web_pwa_oca/manifest.webmanifest")
        manifest_content_str = manifest_data.content.decode("utf-8")
        manifest_content = json.loads(manifest_content_str)

        self.assertEquals(manifest_content["name"], "Test PWA")
        self.assertEquals(manifest_content["short_name"], "Test")
        # icon should remain the default one
        self.assertEquals(
            manifest_content["icons"][0]["src"],
            "/web_pwa_oca/static/img/icons/icon-128x128.png",
        )
        self.assertEquals(manifest_content["icons"][0]["sizes"], "128x128")
        self.assertTrue(manifest_content["icons"][0]["type"].startswith("image/png"))

    def test_manifest_logo_upload(self):
        with open(
            "%s/static/img/icons/odoo_logo.svg" % get_resource_path("web_pwa_oca"), "rb"
        ) as fi:
            icon_to_send = base64.b64encode(fi.read())

        # Set PWA icon in settings
        self.res_config_settings_obj.pwa_icon = icon_to_send
        self.res_config_settings_obj.set_values()

        # Call the manifest controller
        manifest_data = self.url_open("/web_pwa_oca/manifest.webmanifest")
        manifest_content_str = manifest_data.content.decode("utf-8")
        manifest_content = json.loads(manifest_content_str)

        self.assertEquals(manifest_content["icons"][0]["src"], "/web_pwa_oca/icon.svg")
        self.assertTrue(manifest_content["icons"][0]["type"].startswith("image/svg"))
        self.assertEquals(
            manifest_content["icons"][0]["sizes"],
            "128x128 144x144 152x152 192x192 256x256 512x512",
        )

        # Get the icon and compare it
        icon_data = self.url_open("/web_pwa_oca/icon.svg")
        icon_data_bytes = base64.b64encode(icon_data.content)
        self.assertEquals(icon_data_bytes, icon_to_send)

    def test_png_logo_upload(self):
        with open(
            "%s/static/img/icons/icon-512x512.png" % get_resource_path("web_pwa_oca"),
            "rb",
        ) as fi:
            icon_to_send = base64.b64encode(fi.read())

        # Set PWA icon in settings
        self.res_config_settings_obj.pwa_icon = icon_to_send
        self.res_config_settings_obj.set_values()

        # Call the manifest controller
        manifest_data = self.url_open("/web_pwa_oca/manifest.webmanifest")
        manifest_content_str = manifest_data.content.decode("utf-8")
        manifest_content = json.loads(manifest_content_str)

        expected_vals = {
            "src": "/web_pwa_oca/icon512x512.png",
            "sizes": "512x512",
            "type": "image/png",
        }
        self.assertTrue(expected_vals in manifest_content["icons"])

    def test_manifest_logo_upload_big(self):
        # Set PWA icon in settings
        with self.assertRaises(exceptions.UserError):
            # Image with more than 2MB
            self.res_config_settings_obj.pwa_icon = b"a" * 3000000
            self.res_config_settings_obj.set_values()

    def test_manifest_logo_upload_extension(self):
        with self.assertRaises(exceptions.UserError):
            # Image that is not SVG or PNG
            self.res_config_settings_obj.pwa_icon = b"a" * 1000
            self.res_config_settings_obj.set_values()

    def test_manifest_logo_upload_small(self):
        icon_to_send = None
        with open(
            "%s/static/img/icons/icon-128x128.png" % get_resource_path("web_pwa_oca"),
            "rb",
        ) as fi:
            icon_to_send = base64.b64encode(fi.read())
        # Set PWA icon in settings
        with self.assertRaises(exceptions.UserError):
            # Image smaller than 512X512
            self.res_config_settings_obj.pwa_icon = icon_to_send
            self.res_config_settings_obj.set_values()

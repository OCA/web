# Copyright 2019 Alexandre Díaz <dev@redneboa.es>
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).
from PIL import Image

from odoo.tests import common

from ..hooks import uninstall_hook
from ..models.res_company import URL_BASE
from ..utils import image_to_rgb


class TestResCompany(common.TransactionCase):
    IMG_GREEN = (
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUl"
        + "EQVR42mNk+M/wHwAEBgIApD5fRAAAAABJRU5ErkJggg=="
    )

    def _test_scss_attachment(self):
        num_scss = self.env["ir.attachment"].search_count(
            [("url", "ilike", f"{URL_BASE}%")]
        )
        num_companies = self.env["res.company"].search_count([])
        self.assertEqual(num_scss, num_companies, "Invalid scss attachments")

    def test_create_unlink_company(self):
        company_id = self.env["res.company"].create({"name": "Company Test"})
        self.assertEqual(
            company_id.color_navbar_bg, False, "Invalid Navbar Background Color"
        )
        self._test_scss_attachment()
        company_id.sudo().write({"logo": self.IMG_GREEN})
        company_id.button_compute_color()
        self.assertEqual(
            company_id.color_navbar_bg, "#00ff00", "Invalid Navbar Background Color"
        )
        # TODO: We can't remove companies if they have attached data, like
        # warehouse when we have stock module installed
        # company_id.sudo().unlink()
        # self._test_scss_attachment()

    def test_unlink_company_removes_scss_attachment(self):
        company = self.env["res.company"].create({"name": "Company To Delete"})
        attachment = self.env["ir.attachment"].search(
            [("url", "=", company.scss_get_url()), ("company_id", "=", company.id)]
        )
        self.assertTrue(attachment)
        company.unlink()
        self.assertFalse(attachment.exists())

    def test_uninstall_hook_removes_scss_attachments(self):
        attachment = self.env["ir.attachment"].search(
            [("url", "=like", f"{URL_BASE}%")], limit=1
        )
        self.assertTrue(attachment)
        uninstall_hook(self.env)
        self.assertFalse(attachment.exists())

    def test_change_logo(self):
        company_id = self.env["res.company"].search([], limit=1)
        company_id.sudo().write({"logo": self.IMG_GREEN})
        company_id.button_compute_color()
        self.assertEqual(
            company_id.color_navbar_bg, "#00ff00", "Invalid Navbar Background Color"
        )

    def test_scss_sanitized_values(self):
        company_id = self.env["res.company"].search([], limit=1)
        company_id.sudo().write({"color_navbar_bg": False})
        values = company_id.sudo()._scss_get_sanitized_values()
        self.assertEqual(
            values["color_navbar_bg"],
            "$o-brand-odoo",
            "Invalid Navbar Background Color",
        )
        company_id.sudo().write({"color_navbar_bg": "#DEAD00"})
        values = company_id.sudo()._scss_get_sanitized_values()
        self.assertEqual(
            values["color_navbar_bg"], "#DEAD00", "Invalid Navbar Background Color"
        )

    def test_compute_color_without_logo(self):
        company = self.env["res.company"].create(
            {"name": "Company Without Logo", "logo": False}
        )
        company = company.with_context(
            default_color_navbar_bg="#123456",
            default_color_navbar_bg_hover="#234567",
            default_color_navbar_text="#ffffff",
        )
        company.button_compute_color()
        self.assertEqual(company.color_navbar_bg, "#123456")
        self.assertEqual(company.color_navbar_bg_hover, "#234567")
        self.assertEqual(company.color_navbar_text, "#ffffff")

    def test_image_to_rgb_handles_rgb_and_transparent_pixels(self):
        rgb_image = Image.new("RGB", (1, 1), (0, 255, 0))
        self.assertEqual(image_to_rgb(rgb_image), (0.0, 1.0, 0.0))

        rgba_image = Image.new("RGBA", (8, 4), (0, 0, 0, 0))
        rgba_image.paste((0, 255, 0, 255), (4, 0, 8, 4))
        self.assertEqual(image_to_rgb(rgba_image), (0.0, 1.0, 0.0))

    def test_write_ignores_colors_when_context_requests_it(self):
        company = self.env.company
        company.write({"name": "Renamed Company"})
        company.with_context(ignore_company_color=True).write({"name": "Renamed Again"})
        self.assertEqual(company.name, "Renamed Again")

    def test_binary_asset_nodes(self):
        qweb = self.env["ir.qweb"]
        color_nodes = qweb._get_asset_nodes("web_company_color.company_color_assets")
        self.assertTrue(
            any(
                tag == "link" and attributes.get("href", "").startswith(URL_BASE)
                for tag, attributes in color_nodes
            )
        )
        self.assertTrue(qweb._get_asset_nodes("web.assets_backend", binary=True))

    def test_change_color(self):
        company_id = self.env["res.company"].search([], limit=1)
        company_id.sudo().write({"color_navbar_bg": "#DEAD00"})
        self.assertEqual(
            company_id.color_navbar_bg, "#DEAD00", "Invalid Navbar Background Color"
        )
        self.assertEqual(
            company_id.company_colors["color_navbar_bg"],
            "#DEAD00",
            "Invalid Navbar Background Color",
        )
        company_id.sudo().write({"color_navbar_bg": False})
        self.assertFalse(company_id.color_navbar_bg, "Invalid Navbar Background Color")
        self.assertNotIn(
            "color_navbar_bg",
            company_id.company_colors,
            "Invalid Navbar Background Color",
        )

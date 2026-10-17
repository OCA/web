# Copyright 2019 Alexandre Díaz <dev@redneboa.es>
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).
import base64

from odoo.tests import common

from ..models.res_company import URL_BASE


class TestResCompany(common.TransactionCase):
    IMG_GREEN = (
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUl"
        + "EQVR42mNk+M/wHwAEBgIApD5fRAAAAABJRU5ErkJggg=="
    )

    def _test_scss_attachment(self):
        num_scss = self.env["ir.attachment"].search_count(
            [("url", "ilike", "%s%%" % URL_BASE)]
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

    def test_reset_colors(self):
        company_id = self.env["res.company"].search([], limit=1)
        company_id.sudo().write(
            {"color_navbar_bg": "#DEAD00", "color_button_bg": "#00BEEF"}
        )
        self.assertTrue(company_id.company_colors, "Colors should be set before reset")
        company_id.button_reset_colors()
        # Oracle independent from the implementation constant
        self.assertEqual(
            len(company_id._COMPANY_COLOR_FIELDS),
            8,
            "Expected 8 company color fields",
        )
        for field in company_id._COMPANY_COLOR_FIELDS:
            self.assertFalse(
                company_id[field],
                "Color %s should be empty after reset" % field,
            )
        self.assertFalse(
            company_id.company_colors,
            "company_colors should be empty after reset",
        )
        # The SCSS attachment that paints the navbar is regenerated with no colors
        attachment = (
            self.env["ir.attachment"]
            .sudo()
            .search(
                [
                    ("url", "=", company_id.scss_get_url()),
                    ("company_id", "=", company_id.id),
                ]
            )
        )
        content = base64.b64decode(attachment.datas).decode("utf-8")
        self.assertIn("No Web Company Color SCSS Content", content)

    def test_reset_colors_other_company_untouched(self):
        company_a = self.env["res.company"].search([], limit=1)
        company_b = self.env["res.company"].create({"name": "Company Color Test B"})
        company_a.sudo().write({"color_navbar_bg": "#DEAD00"})
        company_b.sudo().write({"color_navbar_bg": "#00BEEF"})
        company_a.button_reset_colors()
        self.assertFalse(company_a.color_navbar_bg, "Company A color should be reset")
        self.assertEqual(
            company_b.color_navbar_bg,
            "#00BEEF",
            "Reset of company A must not affect company B",
        )

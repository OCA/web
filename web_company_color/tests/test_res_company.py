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
        company = self.env["res.company"].search([], limit=1)
        company.sudo().write(
            {
                "color_navbar_bg": "#111111",
                "color_navbar_bg_hover": "#222222",
                "color_navbar_text": "#333333",
                "color_button_bg": "#444444",
                "color_button_bg_hover": "#555555",
                "color_button_text": "#666666",
                "color_link_text": "#777777",
                "color_link_text_hover": "#888888",
                "color_submenu_text": "#999999",
            }
        )
        company.button_reset_colors()
        company.invalidate_recordset()
        self.assertFalse(company.color_navbar_bg, "color_navbar_bg should be reset")
        self.assertFalse(
            company.color_navbar_bg_hover, "color_navbar_bg_hover should be reset"
        )
        self.assertFalse(company.color_navbar_text, "color_navbar_text should be reset")
        self.assertFalse(company.color_button_bg, "color_button_bg should be reset")
        self.assertFalse(
            company.color_button_bg_hover, "color_button_bg_hover should be reset"
        )
        self.assertFalse(company.color_button_text, "color_button_text should be reset")
        self.assertFalse(company.color_link_text, "color_link_text should be reset")
        self.assertFalse(
            company.color_link_text_hover, "color_link_text_hover should be reset"
        )
        self.assertFalse(
            company.color_submenu_text, "color_submenu_text should be reset"
        )
        self.assertFalse(
            company.company_colors, "company_colors should be empty after reset"
        )

    def test_compiled_scss(self):
        """The SCSS is compiled before being sent to the client."""
        # Arrange
        company = self.env.company
        color = "#d2e1dd"
        desaturated_color = "#dadada"
        company.color_navbar_bg = "desaturate(#d2e1dd, 30%)"

        # Act
        company.scss_create_or_update_attachment()

        # Assert
        attachment = self.env["ir.attachment"].search(
            [("url", "=", company.scss_get_url())]
        )
        css = base64.b64decode(attachment.datas).decode()
        self.assertNotIn("desaturate", css)
        self.assertNotIn(color, css)
        self.assertIn(desaturated_color, css)

    def test_ignore_company_color(self):
        """
        Test that we can turn off regenerating css attachment via context key
        """
        company = self.env.company
        attachment = self.env["ir.attachment"].search(
            [("url", "=", company.scss_get_url())]
        )
        attachment.unlink()

        company.company_colors = {}
        attachment = self.env["ir.attachment"].search(
            [("url", "=", company.scss_get_url())]
        )
        self.assertTrue(attachment, "attachment should have been regenerated")

        attachment.unlink()
        company.with_context(ignore_company_color=True).company_colors = {}
        attachment = self.env["ir.attachment"].search(
            [("url", "=", company.scss_get_url())]
        )
        self.assertFalse(attachment, "attachment should not have been regenerated")

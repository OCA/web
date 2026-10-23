# Copyright 2019 Alexandre Díaz <dev@redneboa.es>
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).
import base64
from io import BytesIO

from PIL import Image

from odoo.tests import common, tagged

from ..models.res_company import URL_BASE


@tagged("post_install", "-at_install")
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
            "#714B67",
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

    def test_monochrome_and_transparent_logos(self):
        company = self.env["res.company"].search([], limit=1)
        for rgba, background, text in [
            ((255, 255, 255, 255), "#ffffff", "#000"),
            ((0, 0, 0, 255), "#000000", "#fff"),
            ((0, 0, 0, 0), "#ffffff", "#000"),
        ]:
            with self.subTest(rgba=rgba):
                image = BytesIO()
                Image.new("RGBA", (8, 8), rgba).save(image, format="PNG")
                company.write({"logo": base64.b64encode(image.getvalue())})
                company.button_compute_color()
                self.assertEqual(company.color_navbar_bg, background)
                self.assertEqual(company.color_navbar_text, text)
                attachment = self.env["ir.attachment"].search(
                    [
                        ("url", "=", company.scss_get_url()),
                        ("company_id", "=", company.id),
                    ]
                )
                self.assertEqual(
                    attachment.raw.decode(), company._scss_generate_content()
                )

    def test_all_colour_settings_and_clearing(self):
        import sass

        company = self.env["res.company"].search([], limit=1)
        colour_fields = [
            "color_navbar_bg",
            "color_navbar_bg_hover",
            "color_navbar_text",
            "color_button_bg",
            "color_button_bg_hover",
            "color_button_text",
            "color_link_text",
            "color_link_text_hover",
            "color_submenu_text",
        ]
        for field in colour_fields:
            with self.subTest(field=field):
                company.write({field: "#526780"})
                self.assertEqual(company[field], "#526780")
                company.write({field: False})
                self.assertFalse(company[field])
                sass.compile(
                    string="$o-brand-odoo: #714B67;\n"
                    + company._scss_generate_content()
                )

    def test_navbar_app_name_overrides_submenu_colour(self):
        company = self.env["res.company"].search([], limit=1)
        company.write({"color_navbar_text": "#ffffff", "color_link_text": "#526A87"})
        content = company._scss_generate_content()
        self.assertIn(".o_main_navbar .o_menu_brand", content)
        self.assertIn("color: #ffffff !important", content)

    def test_company_asset_links_do_not_leak_between_requests(self):
        native = self.env["res.company"].create({"name": "Native colour test"})
        sage = self.env["res.company"].create(
            {
                "name": "Sage colour test",
                "color_navbar_bg": "#63796B",
            }
        )
        blue = self.env["res.company"].create(
            {
                "name": "Blue colour test",
                "color_navbar_bg": "#4F6D8A",
            }
        )
        bundle = "web_company_color.company_color_assets"
        # Do not clear caches between companies: production requests share
        # the base asset cache even when their active companies differ.
        for debug in (False, "assets"):
            for company in (sage, native, blue, sage, native):
                with self.subTest(company=company.name, debug=debug):
                    qweb = self.env["ir.qweb"].with_company(company)
                    nodes = qweb._get_asset_nodes(bundle, debug=debug)
                    self.assertEqual(
                        [attrs["href"] for tag, attrs in nodes if tag == "link"],
                        [company.scss_get_url()],
                    )
                    self.assertNotIn("type", nodes[0][1])
                    self.assertFalse(qweb._get_asset_nodes(bundle, css=False))

    def test_colour_groups_only_style_what_is_configured(self):
        company = self.env["res.company"].create(
            {
                "name": "Button only colour test",
                "color_button_bg": "#4F6D8A",
            }
        )
        content = company._scss_generate_content()
        self.assertIn(".btn-primary", content)
        self.assertNotIn(".o_main_navbar", content)
        self.assertNotIn("--link-color:", content)
        values = company._scss_get_sanitized_values()
        # Empty hover/text colours follow the chosen colour, not Odoo purple.
        self.assertEqual(values["color_button_bg_hover"], "#3c536a")
        self.assertEqual(values["color_button_text"], "#FFFFFF")
        company.write({"color_button_bg": False, "color_navbar_bg": "#F2F2F2"})
        content = company._scss_generate_content()
        self.assertIn(".o_main_navbar", content)
        self.assertNotIn(".btn-primary", content)
        self.assertEqual(
            company._scss_get_sanitized_values()["color_navbar_text"], "#000000"
        )

    def test_dropdowns_and_autocomplete_keep_native_colours(self):
        company = self.env["res.company"].create(
            {
                "name": "Dropdown colour test",
                "color_navbar_bg": "#4F6D8A",
                "color_button_bg": "#4F6D8A",
                "color_link_text": "#3E6180",
            }
        )
        content = company._scss_generate_content()
        rules = [rule.split("{")[0] for rule in content.split("}")]
        for selector in rules:
            with self.subTest(selector=selector.strip()):
                # Menu entries keep Odoo's text colour; only the navbar app
                # menus may use the optional submenu colour.
                if ".dropdown-item" in selector and "::" not in selector:
                    self.assertIn("[data-menu-xmlid]", selector)
                self.assertNotIn("ui-state-active:hover", selector)
                self.assertNotIn("a[href]", selector)
        self.assertNotIn("[data-menu-xmlid]", content)
        company.write({"color_submenu_text": "#1F2937"})
        attachment = self.env["ir.attachment"].search(
            [("url", "=", company.scss_get_url()), ("company_id", "=", company.id)]
        )
        self.assertIn("[data-menu-xmlid]", attachment.raw.decode())
        self.assertIn("color: #1F2937;", attachment.raw.decode())

    def test_generated_css_is_plain_css_for_odoo_19_widgets(self):
        import sass

        company = self.env["res.company"].create(
            {
                "name": "Plain CSS colour test",
                "color_navbar_bg": "#63796B",
                "color_button_bg": "#60786A",
                "color_link_text": "#536E5E",
            }
        )
        content = company._scss_generate_content()
        # Served without Sass compilation: no nesting or Sass syntax.
        self.assertNotIn("&", content)
        self.assertNotIn("%(", content)
        sass.compile(string=content)
        for selector in (
            ".o_statusbar_status",  # Odoo 19 current stage
            ".form-check-input:checked",
            ".o_data_row.table-info",  # selected list rows
            "--btn-active-bg",
            "--btn-disabled-bg",
            "--o-input-border-color",
            "--NavBar-entry-color",
            "scrollbar-color",
            "--o-stat-button-color",
            "--KanbanColumn__highlight-border",
            ".o_datetime_picker .o_selected",
            ".o-dropdown.btn-secondary.show",  # open Filters/Group By toggles
            ".form-control:focus",
            ".form-switch.o_switch_toggle .form-check-input",
            "--progress-bar-bg",
        ):
            with self.subTest(selector=selector):
                self.assertIn(selector, content)
        # Switch knob SVG is URL-encoded and must carry the button colour.
        self.assertIn("fill='%2360786a'", content)
        self.assertNotIn("71639e", content.lower())
        self.assertNotIn(".o_arrow_button.btn-primary.disabled", content)
        self.assertNotIn("color: none", content)

    def test_theme_color_meta_follows_company(self):
        company = self.env["res.company"].create({"name": "Theme colour test"})
        Company = self.env["res.company"].with_company(company)
        self.assertEqual(Company._get_company_color_theme_color(), "#71639e")
        company.write({"color_navbar_bg": "#4F6D8A"})
        self.assertEqual(Company._get_company_color_theme_color(), "#4F6D8A")

    def test_company_palette_is_exposed_as_css_variables(self):
        company = self.env["res.company"].search([], limit=1)
        company.write(
            {"color_button_bg": "#1E4F91", "color_button_bg_hover": "#173D70"}
        )
        content = company._scss_generate_content()
        self.assertIn("--web-company-color-primary: #1E4F91;", content)
        self.assertIn("--web-company-color-primary-hover: #173D70;", content)

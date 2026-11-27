# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).
from odoo.tests import HttpCase, tagged


@tagged("post_install", "-at_install")
class TestThemeColor(HttpCase):
    def test_theme_color(self):
        company = self.env["res.company"].create(
            {"name": "Company Test", "color_navbar_bg": "desaturate(#d2e1dd, 30%)"}
        )
        self.env.ref("base.user_admin").company_ids |= company
        self.authenticate("admin", "admin")
        self.opener.cookies["cids"] = str(company.id)
        html = self.url_open("/odoo").text
        self.assertIn('<meta name="theme-color" content="#dadada"', html)

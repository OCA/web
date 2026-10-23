# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).
from odoo.tests import HttpCase, tagged


@tagged("post_install", "-at_install")
class TestThemeColor(HttpCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.company = cls.env.ref("base.main_company")
        cls.company_2 = cls.env["res.company"].create({"name": "Company Test"})
        cls.user = cls.env.ref("base.user_admin")
        cls.user.company_ids |= cls.company_2

    def _get_theme_color_meta(self, cids=None):
        self.authenticate("admin", "admin")
        if cids:
            self.opener.cookies["cids"] = cids
        response = self.url_open("/odoo")
        self.assertEqual(response.status_code, 200)
        return response.text

    def test_theme_color_plain(self):
        self.company.color_navbar_bg = "#DEAD00"
        self.assertEqual(self.company._get_theme_color(), "#DEAD00")

    def test_theme_color_scss_expression(self):
        self.company.color_navbar_bg = "desaturate(#d2e1dd, 30%)"
        self.assertEqual(self.company._get_theme_color(), "#dadada")

    def test_theme_color_unset(self):
        self.company.color_navbar_bg = False
        self.assertFalse(self.company._get_theme_color())

    def test_theme_color_invalid(self):
        self.assertFalse(self.env["res.company"]._compile_theme_color("not-a-color("))

    def test_webclient_theme_color_default(self):
        self.company.color_navbar_bg = False
        html = self._get_theme_color_meta(cids=str(self.company.id))
        self.assertIn('<meta name="theme-color" content="#71639e"', html)

    def test_webclient_theme_color_active_company(self):
        self.company.color_navbar_bg = "#DEAD00"
        self.company_2.color_navbar_bg = "#00FF00"
        html = self._get_theme_color_meta(cids=str(self.company.id))
        self.assertIn('<meta name="theme-color" content="#DEAD00"', html)
        html = self._get_theme_color_meta(cids=f"{self.company_2.id}-{self.company.id}")
        self.assertIn('<meta name="theme-color" content="#00FF00"', html)

    def test_webclient_theme_color_not_allowed_company(self):
        company_3 = self.env["res.company"].create(
            {"name": "Company Test 3", "color_navbar_bg": "#0000FF"}
        )
        self.company.color_navbar_bg = "#DEAD00"
        self.user.company_id = self.company
        html = self._get_theme_color_meta(cids=str(company_3.id))
        self.assertIn('<meta name="theme-color" content="#DEAD00"', html)

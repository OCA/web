# Copyright 2024 OERP Canada <https://www.oerp.ca>
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl)

from PIL import Image

from odoo.tests import tagged
from odoo.tests.common import TransactionCase
from odoo.tools.binary import BinaryBytes
from odoo.tools.image import binary_to_image, image_apply_opt

from odoo.addons.http_routing.tests.common import MockRequest


@tagged("post_install", "-at_install")
class TestWebFavicon(TransactionCase):
    def test_01_web_favicon(self):
        """The goal of this test is to make sure the favicon is correctly
        handled on the backend."""

        # Test setting an Ico file directly, done through create
        Company = self.env["res.company"]

        company = Company.create(
            {
                "name": "Test Company",
                "favicon": Company._get_default_favicon(),
            }
        )

        image = binary_to_image(company.favicon)
        self.assertEqual(image.format, "ICO")

        # Test setting a JPEG file that is too big, done through write
        bg_color = (135, 90, 123)
        image = Image.new("RGB", (1920, 1080), color=bg_color)
        company.favicon = BinaryBytes(image_apply_opt(image, "JPEG"))
        image = binary_to_image(company.favicon)
        self.assertEqual(image.format, "JPEG")
        self.assertEqual(image.size, (1920, 1080))
        self.assertEqual(image.getpixel((0, 0)), bg_color)
        with MockRequest(self.env, cookies={"cids": str(company.id)}):
            self.assertIn(f"/res.company/{company.id}/favicon", Company._get_favicon())

    def test_02_default_favicon_creation(self):
        """Test if default favicon is set when creating a company without favicon."""
        Company = self.env["res.company"]
        company = Company.create({"name": "Test Company"})
        self.assertTrue(company.favicon, "Default favicon not set on company creation.")

    def test_03_favicon_active_company(self):
        """The favicon URL follows the first company of the cids cookie."""
        Company = self.env["res.company"]
        company_1 = Company.create({"name": "Company 1"})
        company_2 = Company.create({"name": "Company 2"})
        cookie = f"{company_2.id}-{company_1.id}"
        with MockRequest(self.env, cookies={"cids": cookie}):
            favicon_url = Company._get_favicon()
        self.assertIn(f"/res.company/{company_2.id}/favicon", favicon_url)

    def test_04_favicon_invalid_cookie(self):
        """An invalid or not allowed company falls back to the current one."""
        Company = self.env["res.company"]
        self.env.company.favicon = Company._get_default_favicon()
        not_allowed = Company.create({"name": "Not Allowed"})
        self.env.user.company_ids -= not_allowed
        for cookie in ("abc", "999999", str(not_allowed.id)):
            with MockRequest(self.env, cookies={"cids": cookie}):
                favicon_url = Company._get_favicon()
            self.assertIn(f"/res.company/{self.env.company.id}/favicon", favicon_url)

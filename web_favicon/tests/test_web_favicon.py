# Copyright 2024 OERP Canada <https://www.oerp.ca>
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl)

from PIL import Image

from odoo.tests import tagged
from odoo.tests.common import TransactionCase
from odoo.tools.image import base64_to_image, image_to_base64

from odoo.addons.website.tools import MockRequest


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

        image = base64_to_image(company.favicon)
        self.assertEqual(image.format, "ICO")

        # Test setting a JPEG file that is too big, done through write
        bg_color = (135, 90, 123)
        image = Image.new("RGB", (1920, 1080), color=bg_color)
        company.favicon = image_to_base64(image, "JPEG")
        image = base64_to_image(company.favicon)
        self.assertEqual(image.format, "JPEG")
        self.assertEqual(image.size, (1920, 1080))
        self.assertEqual(image.getpixel((0, 0)), bg_color)
        with MockRequest(self.env) as mock_request:
            mock_request.httprequest.cookies = {"cids": str(company.id)}
            self.assertTrue(Company._get_favicon())

    def test_02_default_favicon_creation(self):
        """Test if default favicon is set when creating a company without favicon."""
        Company = self.env["res.company"]
        company = Company.create({"name": "Test Company"})
        self.assertTrue(company.favicon, "Default favicon not set on company creation.")

    def test_03_website_favicon(self):
        """Test if favicon URL is correctly returned when website_id is in context."""
        if self.env["ir.module.module"].search(
            [("name", "=", "website"), ("state", "=", "installed")]
        ):
            company = self.env["res.company"].create(
                {
                    "name": "Test Company with Website",
                }
            )
            website = self.env["website"].create(
                {
                    "name": "Test Website",
                    "domain": "www.test.com",
                    "company_id": company.id,
                }
            )
            website.favicon = website._default_favicon()
            favicon_url = company.with_context(website_id=website.id)._get_favicon()
            expected_favicon_url = website.image_url(website, "favicon")
            self.assertEqual(
                favicon_url,
                expected_favicon_url,
                "The favicon URL should match the expected value.",
            )

    def test_04_favicon_multiple_companies(self):
        """Test _get_favicon with multiple companies in cids cookie."""
        Company = self.env["res.company"]

        company_1 = Company.create(
            {"name": "Company 1", "favicon": Company._get_default_favicon()}
        )
        company_2 = Company.create(
            {"name": "Company 2", "favicon": Company._get_default_favicon()}
        )

        with MockRequest(self.env) as mock_request:
            mock_request.httprequest.cookies = {
                "cids": f"{company_1.id}-{company_2.id}"
            }
            favicon_url = Company._get_favicon()

        self.assertTrue(
            favicon_url, "Favicon URL should be generated for multiple companies."
        )
        self.assertIn(
            str(company_1.id),
            favicon_url,
            "Favicon URL should correspond to the first company in the cids cookie.",
        )

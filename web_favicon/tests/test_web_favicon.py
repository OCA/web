# Copyright 2024 OERP Canada <https://www.oerp.ca>
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl)

from PIL import Image

from odoo.tests import tagged
from odoo.tests.common import TransactionCase
from odoo.tools import base64_to_image, image_to_base64


@tagged('post_install', '-at_install')
class TestWebFavicon(TransactionCase):

    def test_01_web_favicon(self):
        """The goal of this test is to make sure the favicon is correctly
        handled on the backend."""

        # Test setting an Ico file directly, done through create
        Company = self.env['res.company']

        company = Company.create({
            'name': 'Test Company',
            'favicon': Company._get_default_favicon(),
        })

        image = base64_to_image(company.favicon)
        self.assertEqual(image.format, 'ICO')

        # Test setting a JPEG file that is too big, done through write
        bg_color = (135, 90, 123)
        image = Image.new('RGB', (1920, 1080), color=bg_color)
        company.favicon = image_to_base64(image, 'JPEG')
        image = base64_to_image(company.favicon)
        self.assertEqual(image.format, 'ICO')
        self.assertEqual(image.size, (256, 256))
        self.assertEqual(image.getpixel((0, 0)), bg_color)

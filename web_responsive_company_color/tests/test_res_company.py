# Copyright 2025 Simone Rubino - PyTech
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

import base64

from odoo.addons.base.tests.common import BaseCommon


class TestResCompany(BaseCommon):
    def test_compiled_scss(self):
        """The SCSS is compiled before being sent to the client."""
        # Arrange
        company = self.env.company
        color = "#d2e1dd"
        result_color = "white"
        company.color_navbar_bg = color

        # Act
        company.scss_create_or_update_attachment()

        # Assert
        attachment = self.env["ir.attachment"].search(
            [("url", "=", company.scss_get_url())]
        )
        css = base64.b64decode(attachment.datas).decode()
        self.assertNotIn("desaturate(", css)
        self.assertNotIn("lighten(", css)
        self.assertIn(f"linear-gradient(to bottom, {color}, {result_color})", css)

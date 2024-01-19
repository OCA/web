# © 2023 Numigi (tm) and all its contributors (https://bit.ly/numigiens)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

from odoo.addons.website_slides.tests.common import (
    SlidesCase,
)


class TestCopySlideChannel(SlidesCase):
    @classmethod
    def setUpClass(cls):
        super(TestCopySlideChannel, cls).setUpClass()

    def test_copy_website_slides_and_courses(self):
        self.assertEqual(len(self.channel.slide_ids), 4, msg=None)
        channel_2 = self.channel.copy({"name": "My new copy channel"})
        self.assertEqual(len(channel_2.slide_ids), 4, msg=None)
        self.assertEqual(
            channel_2.slide_ids.mapped("name"),
            self.channel.slide_ids.mapped("name"),
            msg=None,
        )

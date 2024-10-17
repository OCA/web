# Copyright 2024 ACSONE SA/NV
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

import io

from PIL import Image

from odoo.tests import HttpCase


class TestReportBarcode(HttpCase):
    def test_report_barcode_rotate(self):
        barcode_value = "a0c1s0o1n0e"
        response = self.url_open(f"/report/barcode/Code128/{barcode_value}")
        barcode_image = Image.open(io.BytesIO(response.content))
        barcode_image_size = barcode_image.size
        # Ensure that the next tests makes sense.
        self.assertNotEqual(*barcode_image_size)

        # Ensure that rotation is performed.
        counter_clockwise_rotated_response = self.url_open(
            f"/report/barcode/Code128/{barcode_value}?rotate=90"
        )
        rotated_barcode_image = Image.open(
            io.BytesIO(counter_clockwise_rotated_response.content)
        )
        rotated_barcode_image_size = rotated_barcode_image.size
        # Check that the height and width have been interchanged, which correspond to a 90°
        # rotation.
        self.assertEqual(
            list(barcode_image_size), list(reversed(rotated_barcode_image_size))
        )

        # Ensure that negative values are supported and correctly handled.
        rotated_response = self.url_open(
            f"/report/barcode/Code128/{barcode_value}?rotate=-90"
        )
        rotated_barcode_image = Image.open(io.BytesIO(rotated_response.content))
        rotated_barcode_image_size = rotated_barcode_image.size
        self.assertEqual(
            list(barcode_image_size), list(reversed(rotated_barcode_image_size))
        )
        # Ensure that counter clockwise rotation does not produce the same as
        # clockwise rotation.
        self.assertNotEqual(
            counter_clockwise_rotated_response.content, rotated_response.content
        )

        # Ensure that warning log is present when rotate value is not numeric.
        barcode_rotate = "ninety"
        with self.assertLogs(level="WARNING") as logs:
            response = self.url_open(
                f"/report/barcode/Code128/{barcode_value}?rotate={barcode_rotate}"
            )
            self.assertEqual(len(logs.output), 1)
            self.assertIn(
                "You passed 'rotate' attribute to 'report_barcode' request but the value "
                f"is not correct ({barcode_rotate})",
                logs.output[0],
            )

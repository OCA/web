# Part of Barberhood. See LICENSE file for full copyright and licensing details.
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU Lesser General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU Lesser General Public License for more details.
#
# You should have received a copy of the GNU Lesser General Public License
# along with this program.  If not, see <http://www.gnu.org/licenses/>.

from freezegun import freeze_time

from odoo.tests import common


class TestDayPilotBasic(common.TransactionCase):
    def test_view_type_registered(self):
        """Test that daypilot view type is registered"""
        view = self.env["ir.ui.view"]
        self.assertIn("daypilot", view._fields["type"].get_values(self.env))

    def test_ir_ui_view_has_daypilot_validation(self):
        """Test that ir.ui.view has daypilot validation method"""
        view = self.env["ir.ui.view"]
        self.assertTrue(hasattr(view, "_validate_tag_daypilot"))

    def test_get_daypilot_default_time_current_time(self):
        """Test that default time uses current time when no business hours provided"""
        result = self.env["base"].get_daypilot_default_time()

        # Should return current time and current time + 1 hour
        self.assertIn("start", result)
        self.assertIn("stop", result)
        self.assertTrue(result["start"])
        self.assertTrue(result["stop"])

    @freeze_time("2026-09-08 10:30:00")
    def test_get_daypilot_default_time_during_business_hours(self):
        """Test that default time uses current time during business hours"""
        result = (
            self.env["base"]
            .with_context(tz="UTC")
            .get_daypilot_default_time(business_hours_start=9, business_hours_end=17)
        )

        # Should use current time since it's during business hours
        self.assertIn("start", result)
        self.assertIn("stop", result)
        self.assertIn("10:30:00", result["start"])

    @freeze_time("2026-09-08 07:30:00")
    def test_get_daypilot_default_time_before_business_hours(self):
        """Test that default time snaps to business hours start when before"""
        result = (
            self.env["base"]
            .with_context(tz="UTC")
            .get_daypilot_default_time(business_hours_start=9, business_hours_end=17)
        )

        # Should snap to 9:00 AM (business hours start)
        self.assertIn("start", result)
        self.assertIn("stop", result)
        # The start time should be around 9:00 AM
        self.assertIn("09:00:00", result["start"])

    @freeze_time("2026-09-08 18:30:00")
    def test_get_daypilot_default_time_after_business_hours(self):
        """Test that default time snaps to next day when after business hours"""
        result = (
            self.env["base"]
            .with_context(tz="UTC")
            .get_daypilot_default_time(business_hours_start=9, business_hours_end=17)
        )

        # Should snap to next day 9:00 AM
        self.assertIn("start", result)
        self.assertIn("stop", result)
        # The start time should be around 9:00 AM of the next day
        self.assertIn("09:00:00", result["start"])

    def test_get_daypilot_default_time_utc_timezone(self):
        """Test that default time works correctly with UTC timezone"""
        result = self.env["base"].with_context(tz="UTC").get_daypilot_default_time()

        # Should return current time in UTC
        self.assertIn("start", result)
        self.assertIn("stop", result)
        self.assertTrue(result["start"])
        self.assertTrue(result["stop"])

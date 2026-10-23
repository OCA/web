from odoo.tests import common


class TestDayPilotView(common.HttpCase):
    """Test DayPilot view rendering and basic functionality"""

    def test_daypilot_view_can_be_created(self):
        """Test that a DayPilot view can be created programmatically"""
        view = self.env["ir.ui.view"].create(
            {
                "name": "Test DayPilot View",
                "type": "daypilot",
                "model": "res.partner",
                "arch": (
                    '<daypilot date_start="create_date" '
                    'date_stop="write_date" string="Test"/>'
                ),
            }
        )
        self.assertTrue(view)
        self.assertEqual(view.type, "daypilot")
        self.assertEqual(view.model, "res.partner")

    def test_daypilot_view_arch_validation(self):
        """Test that DayPilot view arch is validated correctly"""
        # Valid arch
        view = self.env["ir.ui.view"].create(
            {
                "name": "Valid DayPilot View",
                "type": "daypilot",
                "model": "res.partner",
                "arch": (
                    "<daypilot "
                    'date_start="create_date" '
                    'date_stop="write_date" '
                    'string="Valid" '
                    'default_scale="CellDuration" '
                    'default_range="week" '
                    'time_slot_duration="30" '
                    'business_hours_start="8" '
                    'business_hours_end="18" '
                    'business_hours_only="true" '
                    'show_current_time="true" '
                    'edit="1" '
                    'create="1" '
                    "/>"
                ),
            }
        )
        self.assertTrue(view)

        # Invalid arch (missing required attributes) - should raise validation error
        with self.assertRaises(Exception) as context:
            self.env["ir.ui.view"].create(
                {
                    "name": "Invalid DayPilot View",
                    "type": "daypilot",
                    "model": "res.partner",
                    "arch": '<daypilot string="Invalid"/>',  # Missing date_start,
                    # date_stop
                }
            )
        self.assertIn("date_start", str(context.exception))

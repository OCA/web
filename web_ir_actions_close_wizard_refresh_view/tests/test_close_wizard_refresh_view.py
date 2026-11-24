# Copyright 2025 TRIVAX INNOVA SL
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl)

from odoo.tests.common import TransactionCase


class TestCloseWizardRefreshView(TransactionCase):
    def test_action_model_exists(self):
        """Test that the action model is properly registered."""
        self.assertIn("ir.actions.close_wizard_refresh_view", self.env.registry)

    def test_action_type(self):
        """Test that the action type defaults correctly."""
        action = self.env["ir.actions.close_wizard_refresh_view"].create(
            {"name": "Test close wizard"}
        )
        self.assertEqual(action.type, "ir.actions.close_wizard_refresh_view")

    def test_action_inherits_act_window_close(self):
        """Test that the action inherits from act_window_close."""
        Model = self.env["ir.actions.close_wizard_refresh_view"]
        self.assertIn(
            "ir.actions.act_window_close",
            Model._inherit if isinstance(Model._inherit, list) else [Model._inherit],
        )

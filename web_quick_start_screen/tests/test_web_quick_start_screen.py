# Copyright 2024 Tecnativa - David Vidal
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl.html).
from odoo.tests import TransactionCase


class TestQuickStartActionsCommon(TransactionCase):
    def _test_screen_action(self, screen_action):
        """Basic test helper. For a more complete one we'd need a tour"""
        action = screen_action.run_action()
        if action["type"] == "ir.actions.server":
            action = (
                self.env.ref(action["xml_id"])
                .with_context(**screen_action._get_extra_context())
                .run()
            )
        return action


class TestQuickStartActions(TestQuickStartActionsCommon):
    def test_demo_screen_actions(self):
        """Let's test every action screen in our demo data"""
        demo_start_screen = self.env.ref(
            "web_quick_start_screen.quick_start_screen_demo"
        )
        for action in demo_start_screen.action_ids:
            self._test_screen_action(action)

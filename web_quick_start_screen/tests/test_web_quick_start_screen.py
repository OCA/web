# Copyright 2024 Tecnativa - David Vidal
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl.html).
from unittest.mock import patch

from odoo import Command

from .test_web_quick_start_screen_common import WebQuickStartScreenCommon


class TestQuickStartActionsCommon(WebQuickStartScreenCommon):
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
        for action in self.start_screen_1.action_ids:
            self._test_screen_action(action)

    def test_screen_action_server(self):
        """Test _test_screen_action with a server action to cover lines 14-15"""
        server_action = self.env["ir.actions.server"].create(
            {
                "name": "Test Server Action",
                "model_id": self.env["ir.model"]._get_id("res.partner"),
                "state": "code",
                "code": "action = {'type': 'ir.actions.act_window_close'}",
            }
        )
        self.env["ir.model.data"].create(
            {
                "name": "test_server_action",
                "module": "web_quick_start_screen",
                "model": "ir.actions.server",
                "res_id": server_action.id,
            }
        )
        action_server = self.env["quick.start.screen.action"].create(
            {
                "name": "Server Action",
                "action_ref_id": f"ir.actions.server,{server_action.id}",
            }
        )
        res = self._test_screen_action(action_server)
        self.assertEqual(res.get("type"), "ir.actions.act_window_close")


class TestQuickStartScreenVisibility(WebQuickStartScreenCommon):
    """Tests for _visible_action_ids covering access-check branches"""

    def test_visible_action_ids_with_model(self):
        """Actions with an act_window ref should appear when user has read access"""
        visible = self.start_screen_1._visible_action_ids()
        self.assertIn(self.quick_start_screen_action_1.id, visible)
        self.assertIn(self.quick_start_screen_action_2.id, visible)

    def test_visible_action_ids_no_model_access(self):
        """Actions whose model has no read access should be excluded"""
        # Clear ormcache so the body executes fresh under the mock
        self.env.registry.clear_cache()
        # Patch ir.model.access.check to deny access
        with patch.object(
            type(self.env["ir.model.access"]),
            "check",
            return_value=False,
        ):
            visible = self.start_screen_1._visible_action_ids()
        # Since check returns False, act_window actions should be excluded
        self.assertNotIn(self.quick_start_screen_action_1.id, visible)

    def test_visible_action_ids_with_report_action(self):
        """ir.actions.report (model field) is included when user has read access"""
        report_action = self.env["ir.actions.report"].create(
            {
                "name": "Dummy Report",
                "model": "res.partner",
                "report_name": "dummy.report",
            }
        )
        action_report = self.env["quick.start.screen.action"].create(
            {
                "name": "Report Visibility",
                "action_ref_id": f"ir.actions.report,{report_action.id}",
            }
        )
        screen = self.env["quick.start.screen"].create(
            {
                "name": "Report Screen",
                "action_ids": [Command.link(action_report.id)],
            }
        )
        visible = screen._visible_action_ids()
        self.assertIn(action_report.id, visible)

    def test_visible_action_ids_with_server_action(self):
        """ir.actions.server (model_name field) is included when user has read access"""
        model_id = (
            self.env["ir.model"].search([("model", "=", "res.partner")], limit=1).id
        )
        server_action = self.env["ir.actions.server"].create(
            {
                "name": "Visibility Server Action",
                "model_id": model_id,
                "state": "code",
                "code": "action = {'type': 'ir.actions.act_window_close'}",
            }
        )
        action_server = self.env["quick.start.screen.action"].create(
            {
                "name": "Server Visibility",
                "action_ref_id": f"ir.actions.server,{server_action.id}",
            }
        )
        screen = self.env["quick.start.screen"].create(
            {
                "name": "Server Screen",
                "action_ids": [Command.link(action_server.id)],
            }
        )
        visible = screen._visible_action_ids()
        self.assertIn(action_server.id, visible)

    def test_visible_action_ids_action_without_model(self):
        """Actions whose action type has no associated model field (e.g. act_url)
        should always be visible regardless of access check"""
        act_url = self.env["ir.actions.act_url"].create(
            {"name": "Test URL", "url": "https://odoo.com", "target": "new"}
        )
        action_url = self.env["quick.start.screen.action"].create(
            {
                "name": "URL Action",
                "action_ref_id": f"ir.actions.act_url,{act_url.id}",
            }
        )
        screen = self.env["quick.start.screen"].create(
            {
                "name": "URL Screen",
                "action_ids": [Command.link(action_url.id)],
            }
        )
        visible = screen._visible_action_ids()
        self.assertIn(action_url.id, visible)

    def test_visible_action_ids_with_client_action(self):
        """ir.actions.client has no model field, so it should always be visible"""
        act_client = self.env["ir.actions.client"].create(
            {"name": "Test Client Action", "tag": "test_tag"}
        )
        action_client = self.env["quick.start.screen.action"].create(
            {
                "name": "Client Action",
                "action_ref_id": f"ir.actions.client,{act_client.id}",
            }
        )
        screen = self.env["quick.start.screen"].create(
            {
                "name": "Client Screen",
                "action_ids": [Command.link(action_client.id)],
            }
        )
        visible = screen._visible_action_ids()
        self.assertIn(action_client.id, visible)


class TestQuickStartScreenAction(WebQuickStartScreenCommon):
    """Tests for action_screen_actions covering all self-resolution branches"""

    def test_action_screen_actions_with_self(self):
        """Calling on a concrete record returns the kanban action"""
        action = self.start_screen_1.action_screen_actions()
        self.assertEqual(action["type"], "ir.actions.act_window")
        self.assertEqual(action["view_mode"], "kanban")
        self.assertEqual(action["res_model"], "quick.start.screen.action")

    def test_action_screen_actions_uses_user_screen_when_empty(self):
        """Calling on an empty set falls back to the user's quick_start_screen_id"""
        self.env.user.quick_start_screen_id = self.start_screen_1
        empty = self.env["quick.start.screen"].browse([])
        action = empty.action_screen_actions()
        self.assertEqual(action["type"], "ir.actions.act_window")

    def test_action_screen_actions_uses_context_default_when_no_user_screen(self):
        """When user has no screen,
        falls back to default_quick_start_screen_id in context"""
        self.env.user.quick_start_screen_id = False
        empty = self.env["quick.start.screen"].browse([])
        action = empty.with_context(
            default_quick_start_screen_id=self.start_screen_1.id
        ).action_screen_actions()
        self.assertEqual(action["type"], "ir.actions.act_window")

    def test_action_screen_actions_name_fallback(self):
        """Screen without a name uses 'Start' as display/action name"""
        unnamed_screen = self.env["quick.start.screen"].create(
            {
                "action_ids": [
                    Command.link(self.quick_start_screen_action_1.id),
                ],
            }
        )
        action = unnamed_screen.action_screen_actions()
        self.assertEqual(action["name"], self.env._("Start"))

    def test_action_screen_actions_with_name(self):
        """Screen with a name propagates it to the action"""
        action = self.start_screen_1.action_screen_actions()
        self.assertEqual(action["name"], "start_screen_1")

    def test_action_screen_actions_domain_filters_invisible(self):
        """Domain in the returned action only includes visible action ids"""
        visible_ids = self.start_screen_1._visible_action_ids()
        action = self.start_screen_1.action_screen_actions()
        domain = action["domain"]
        # domain is [("id", "in", [...])]
        filtered_ids = set(domain[0][2])
        # All returned ids must be in the visible set
        self.assertTrue(filtered_ids.issubset(visible_ids))

    def test_action_screen_actions_empty_with_no_fallback(self):
        """When called on empty set with no user screen and no context default,
        _prepare_screen_action is still called (self becomes empty browse)"""
        self.env.user.quick_start_screen_id = False
        empty = self.env["quick.start.screen"].browse([])
        # browse([]) resolves to empty; _prepare_screen_action runs with no name
        action = empty.action_screen_actions()
        self.assertEqual(action["type"], "ir.actions.act_window")
        self.assertEqual(action["name"], self.env._("Start"))


class TestQuickStartScreenActionModel(WebQuickStartScreenCommon):
    """Tests for quick.start.screen.action methods"""

    def _make_server_action(self):
        """Helper: create a simple server action"""
        return self.env["ir.actions.server"].create(
            {
                "name": "Test Server Action",
                "model_id": self.env["ir.model"]
                .search([("model", "=", "res.partner")], limit=1)
                .id,
                "state": "code",
                "code": "action = {'type': 'ir.actions.act_window_close'}",
            }
        )

    def test_run_action_without_context_or_domain(self):
        """run_action without extra context/domain returns raw action dict"""
        action = self.quick_start_screen_action_1.run_action()
        self.assertIsInstance(action, dict)
        self.assertIn("type", action)

    def test_run_action_with_extra_context(self):
        """run_action merges extra context into the action"""
        self.quick_start_screen_action_1.write(
            {"context": "{'search_default_customer': 1}"}
        )
        action = self.quick_start_screen_action_1.run_action()
        self.assertEqual(action["context"].get("search_default_customer"), 1)

    def test_run_action_with_context_active_id(self):
        """run_action handles active_id in extra context correctly"""
        self.quick_start_screen_action_1.write(
            {"context": "{'active_id': 42, 'my_flag': True}"}
        )
        action = self.quick_start_screen_action_1.run_action()
        self.assertTrue(action["context"].get("my_flag"))

    def test_run_action_with_domain(self):
        """run_action applies extra domain from the domain field"""
        self.quick_start_screen_action_1.write(
            {"domain": "[('is_company', '=', True)]"}
        )
        action = self.quick_start_screen_action_1.run_action()
        self.assertIn(("is_company", "=", True), action["domain"])

    def test_run_action_with_domain_and_context(self):
        """run_action applies both extra domain and context"""
        self.quick_start_screen_action_1.write(
            {
                "domain": "[('is_company', '=', True)]",
                "context": "{'search_default_customer': 1}",
            }
        )
        action = self.quick_start_screen_action_1.run_action()
        self.assertIn(("is_company", "=", True), action["domain"])
        self.assertEqual(action["context"].get("search_default_customer"), 1)

    def test_get_extra_context_empty(self):
        """_get_extra_context returns {} when context field is empty"""
        ctx = self.quick_start_screen_action_1._get_extra_context()
        self.assertEqual(ctx, {})

    def test_get_extra_context_with_value(self):
        """_get_extra_context evaluates and returns the context dict"""
        self.quick_start_screen_action_1.write({"context": "{'key': 'val'}"})
        ctx = self.quick_start_screen_action_1._get_extra_context()
        self.assertEqual(ctx.get("key"), "val")

    def test_safe_eval_with_ref(self):
        """_safe_eval supports ref() calls"""
        partner_action_id = self.env.ref("base.action_partner_form").id
        result = self.quick_start_screen_action_1._safe_eval(
            "ref('base.action_partner_form')"
        )
        self.assertEqual(result, partner_action_id)

    def test_safe_eval_with_datetime(self):
        """_safe_eval exposes the datetime module"""
        result = self.quick_start_screen_action_1._safe_eval(
            "datetime.date(2024, 1, 1)"
        )
        import datetime as dt

        self.assertEqual(result, dt.date(2024, 1, 1))

    def test_safe_eval_with_context_today(self):
        """_safe_eval exposes context_today callable"""
        result = self.quick_start_screen_action_1._safe_eval("context_today()")
        self.assertIsNotNone(result)

    def test_run_action_with_server_action(self):
        """run_action works for an ir.actions.server reference"""
        server_action = self._make_server_action()
        action_rec = self.env["quick.start.screen.action"].create(
            {
                "name": "Server Action",
                "action_ref_id": f"ir.actions.server,{server_action.id}",
            }
        )
        action = action_rec.run_action()
        self.assertIn("type", action)

    def test_run_action_with_report_action(self):
        """run_action works for an ir.actions.report reference"""
        report_action = self.env["ir.actions.report"].create(
            {
                "name": "Dummy Report",
                "model": "res.partner",
                "report_name": "dummy.report",
            }
        )
        action_rec = self.env["quick.start.screen.action"].create(
            {
                "name": "Report Action",
                "action_ref_id": f"ir.actions.report,{report_action.id}",
            }
        )
        action = action_rec.run_action()
        self.assertIn("type", action)

    def test_run_action_with_url_action(self):
        """run_action works for an ir.actions.act_url reference"""
        url_action = self.env["ir.actions.act_url"].create(
            {
                "name": "Test URL",
                "url": "https://odoo.com",
                "target": "new",
            }
        )
        action_rec = self.env["quick.start.screen.action"].create(
            {
                "name": "URL Action",
                "action_ref_id": f"ir.actions.act_url,{url_action.id}",
            }
        )
        action = action_rec.run_action()
        self.assertEqual(action.get("type"), "ir.actions.act_url")

    def test_run_action_with_client_action(self):
        """run_action works for an ir.actions.client reference"""
        client_action = self.env["ir.actions.client"].create(
            {
                "name": "Test Client",
                "tag": "test_tag",
            }
        )
        action_rec = self.env["quick.start.screen.action"].create(
            {
                "name": "Client Action",
                "action_ref_id": f"ir.actions.client,{client_action.id}",
            }
        )
        action = action_rec.run_action()
        self.assertEqual(action.get("type"), "ir.actions.client")

    def test_run_action_with_dict_context(self):
        """run_action handles action context that is already a dict (Odoo 19+)"""
        with patch.object(
            type(self.quick_start_screen_action_1.action_ref_id),
            "_get_action_dict",
            return_value={"type": "ir.actions.act_window", "context": {"existing": 1}},
        ):
            self.quick_start_screen_action_1.write({"context": "{'extra': 2}"})
            action = self.quick_start_screen_action_1.run_action()
            self.assertEqual(action["context"].get("existing"), 1)
            self.assertEqual(action["context"].get("extra"), 2)


class TestResUsers(WebQuickStartScreenCommon):
    """Tests for the res.users extension"""

    def test_user_quick_start_screen_field_exists(self):
        """quick_start_screen_id field is accessible on res.users"""
        user = self.env.user
        # Field should exist and be assignable
        user.quick_start_screen_id = self.start_screen_1
        self.assertEqual(user.quick_start_screen_id, self.start_screen_1)

    def test_user_quick_start_screen_field_can_be_unset(self):
        """quick_start_screen_id can be cleared"""
        self.env.user.quick_start_screen_id = self.start_screen_1
        self.env.user.quick_start_screen_id = False
        self.assertFalse(self.env.user.quick_start_screen_id)

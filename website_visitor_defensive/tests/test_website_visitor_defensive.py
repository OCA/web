from unittest.mock import MagicMock, patch

import psycopg2

import odoo.http as http
from odoo.tests.common import TransactionCase, tagged
from odoo.tools import mute_logger


@tagged("-at_install", "post_install")
class TestWebsiteVisitorDefensive(TransactionCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.Visitor = cls.env["website.visitor"]

    def _push_fake_request(self, path="/", **kwargs):
        fake_request = MagicMock()
        fake_request.env = MagicMock()
        fake_request.env.uid = (kwargs.get("env") or self.env).uid
        fake_request.lang.id = 1
        fake_request.geoip.get.return_value = "PT"
        fake_request.website.id = 1
        fake_request.httprequest.remote_addr = kwargs.get("remote_addr", "127.0.0.1")
        fake_request.httprequest.environ.get.return_value = kwargs.get(
            "user_agent", "test-agent"
        )
        fake_request.httprequest.path = path
        fake_request.httprequest.headers.get.return_value = None
        fake_request.session.sid = kwargs.get("session_sid", "test-session")
        fake_request.env.user._is_public.return_value = kwargs.get("public", True)
        http._request_stack.push(fake_request)
        return fake_request

    def _pop_request(self):
        http._request_stack.pop()

    def test_register_website_track_skips_static_paths(self):
        """Tracking is skipped for the public asset URLs that cause
        concurrent visitor upsert contention."""
        self._push_fake_request(path="/web/assets/1/foo")
        try:
            result = self.env["ir.http"]._register_website_track(
                MagicMock(status_code=200)
            )
            self.assertFalse(result)
        finally:
            self._pop_request()

    @mute_logger("odoo.addons.website_visitor_defensive.models.website_visitor")
    def test_get_visitor_from_request_returns_none_on_serialization(self):
        """When _upsert_visitor raises a PostgreSQL serialization failure,
        _get_visitor_from_request must return None instead of letting the
        request fall into Odoo's retry/backoff loop."""

        def raise_serialization(*args, **kwargs):
            raise psycopg2.errors.SerializationFailure(
                "could not serialize access due to concurrent update"
            )

        self._push_fake_request(path="/")
        try:
            with patch.object(
                self.Visitor.__class__,
                "_upsert_visitor",
                side_effect=raise_serialization,
            ):
                result = self.Visitor._get_visitor_from_request(
                    force_create=True,
                    force_track_values={"url": "/test", "page_id": False},
                )
                self.assertIsNone(result)
        finally:
            self._pop_request()

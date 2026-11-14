from werkzeug.exceptions import NotFound

from odoo import _, http
from odoo.exceptions import AccessError
from odoo.http import request

from odoo.addons.mail.controllers.discuss.channel import ChannelController
from odoo.addons.mail.models.discuss.mail_guest import add_guest_to_context
from odoo.addons.mail.tools.discuss import Store


class PortalDiscussChannelController(ChannelController):
    """Apply portal membership checks to native Discuss endpoints."""

    def _get_portal_channel(self, channel_id):
        channel = request.env["discuss.channel"].browse(channel_id).exists()
        if not channel:
            raise NotFound()
        user = request.env.user
        if user._is_portal():
            channel._portal_check_access(user)
        elif not user._is_internal() and not user._is_public():
            raise AccessError(_("You are not allowed to access this channel."))
        return channel

    @http.route(
        "/discuss/channel/messages", methods=["POST"], type="json", auth="public"
    )
    @add_guest_to_context
    def discuss_channel_messages(
        self,
        channel_id,
        search_term=None,
        before=None,
        after=None,
        limit=30,
        around=None,
    ):
        if not request.env.user._is_portal():
            return super().discuss_channel_messages(
                channel_id,
                search_term=search_term,
                before=before,
                after=after,
                limit=limit,
                around=around,
            )
        channel = self._get_portal_channel(channel_id)
        try:
            limit = min(max(int(limit or 30), 1), 100)
        except (TypeError, ValueError):
            limit = 30
        result = (
            request.env["mail.message"]
            .sudo()
            ._message_fetch(
                [
                    ("model", "=", "discuss.channel"),
                    ("res_id", "=", channel.id),
                    ("message_type", "!=", "user_notification"),
                ],
                search_term=search_term,
                before=before,
                after=after,
                around=around,
                limit=limit,
            )
        )
        messages = result.pop("messages")
        if not around:
            messages.set_message_done()
        return {
            **result,
            "data": Store(messages, for_current_user=True).get_result(),
            "messages": Store.many_ids(messages),
        }

    @http.route(
        "/discuss/channel/info",
        methods=["POST"],
        type="json",
        auth="public",
        readonly=True,
    )
    @add_guest_to_context
    def discuss_channel_info(self, channel_id):
        if not request.env.user._is_portal():
            return super().discuss_channel_info(channel_id)
        return Store(self._get_portal_channel(channel_id)).get_result()

    @http.route(
        "/discuss/channel/members",
        methods=["POST"],
        type="json",
        auth="public",
        readonly=True,
    )
    @add_guest_to_context
    def discuss_channel_members(self, channel_id, known_member_ids):
        if not request.env.user._is_portal():
            return super().discuss_channel_members(channel_id, known_member_ids)
        return self._get_portal_channel(channel_id)._load_more_members(known_member_ids)

    @http.route(
        "/discuss/channel/pinned_messages",
        methods=["POST"],
        type="json",
        auth="public",
        readonly=True,
    )
    @add_guest_to_context
    def discuss_channel_pins(self, channel_id):
        if not request.env.user._is_portal():
            return super().discuss_channel_pins(channel_id)
        channel = self._get_portal_channel(channel_id)
        messages = channel.pinned_message_ids.sorted(key="pinned_at", reverse=True)
        return Store(messages, for_current_user=True).get_result()

    @http.route(
        "/discuss/channel/attachments",
        methods=["POST"],
        type="json",
        auth="public",
        readonly=True,
    )
    @add_guest_to_context
    def load_attachments(self, channel_id, limit=30, before=None):
        if not request.env.user._is_portal():
            return super().load_attachments(channel_id, limit=limit, before=before)
        channel = self._get_portal_channel(channel_id)
        domain = [
            ("res_id", "=", channel.id),
            ("res_model", "=", "discuss.channel"),
        ]
        if before:
            domain.append(("id", "<", before))
        return Store(
            request.env["ir.attachment"]
            .sudo()
            .search(domain, limit=limit, order="id DESC")
        ).get_result()

    @http.route(
        "/discuss/channel/notify_typing",
        methods=["POST"],
        type="json",
        auth="public",
    )
    @add_guest_to_context
    def discuss_channel_notify_typing(self, channel_id, is_typing):
        if not request.env.user._is_portal():
            return super().discuss_channel_notify_typing(channel_id, is_typing)
        channel = self._get_portal_channel(channel_id)
        member = (
            request.env["discuss.channel.member"]
            .sudo()
            .search(
                [
                    ("channel_id", "=", channel.id),
                    ("partner_id", "=", request.env.user.partner_id.id),
                ],
                limit=1,
            )
        )
        if not member:
            raise NotFound()
        member._notify_typing(is_typing)

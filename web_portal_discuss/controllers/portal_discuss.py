from werkzeug.exceptions import NotFound

from odoo import http
from odoo.http import request

from odoo.addons.mail.controllers.discuss.public_page import PublicPageController
from odoo.addons.mail.models.discuss.mail_guest import add_guest_to_context
from odoo.addons.mail.tools.discuss import Store


class PortalDiscussController(PublicPageController):
    """Expose native Discuss channels to portal members."""

    def _get_portal_channels(self, user=None):
        user = user or request.env.user
        if not user._is_portal():
            return request.env["discuss.channel"]
        return (
            request.env["discuss.channel"]
            .sudo()
            .search(
                [
                    ("active", "=", True),
                    ("channel_member_ids.partner_id", "=", user.partner_id.id),
                ]
            )
        )

    def _get_selected_channel(self, channels, channel_id):
        if not channel_id:
            return channels[:1]
        try:
            channel_id = int(channel_id)
        except (TypeError, ValueError):
            return channels[:1]
        return channels.filtered(lambda channel: channel.id == channel_id)[:1]

    def _prepare_discuss_data(self, selected_channel):
        """Build the native public Discuss store for the selected channel."""
        return Store(
            {
                "companyName": request.env.company.name,
                "inPublicPage": True,
                "discuss_public_thread": Store.one(selected_channel),
            }
        ).get_result()

    @http.route("/my/discuss", type="http", auth="user", website=True)
    def portal_discuss(self, channel_id=None, **kwargs):
        user = request.env.user
        if user._is_internal():
            return request.redirect("/odoo/action-mail.action_discuss")
        if not user._is_portal():
            raise NotFound()

        channels = self._get_portal_channels(user)
        channels._portal_check_access(user)
        selected_channel = self._get_selected_channel(channels, channel_id)
        data = self._prepare_discuss_data(selected_channel)
        return request.render(
            "web_portal_discuss.portal_discuss",
            {
                "channels": channels,
                "selected_channel": selected_channel,
                "discuss_data": data,
                "session_info": request.env["ir.http"].session_info(),
            },
        )

    @http.route(
        "/discuss/channel/<int:channel_id>",
        type="http",
        auth="public",
        website=True,
    )
    @add_guest_to_context
    def discuss_channel(
        self, channel_id, *, highlight_message_id=None, portal_embed=False
    ):
        user = request.env.user
        if user._is_portal():
            channel = request.env["discuss.channel"].browse(channel_id).exists()
            if not channel:
                raise NotFound()
            channel._portal_check_access(user)
            if not portal_embed:
                return request.redirect(f"/my/discuss?channel_id={channel.id}")
        return super().discuss_channel(
            channel_id, highlight_message_id=highlight_message_id
        )

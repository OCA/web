from odoo import http
from odoo.http import request

from odoo.addons.mail.controllers.thread import ThreadController
from odoo.addons.mail.models.discuss.mail_guest import add_guest_to_context


class PortalDiscussThreadController(ThreadController):
    """Enforce channel membership for portal Discuss message posting."""

    def _check_portal_channel_access(self, thread_model, thread_id):
        if thread_model != "discuss.channel":
            return
        user = request.env.user
        if not user._is_portal():
            return
        channel = request.env[thread_model].browse(thread_id).exists()
        if channel:
            channel._portal_check_access(user)

    @http.route("/mail/message/post", methods=["POST"], type="json", auth="public")
    @add_guest_to_context
    def mail_message_post(
        self, thread_model, thread_id, post_data, context=None, **kwargs
    ):
        self._check_portal_channel_access(thread_model, thread_id)
        return super().mail_message_post(
            thread_model, thread_id, post_data, context=context, **kwargs
        )

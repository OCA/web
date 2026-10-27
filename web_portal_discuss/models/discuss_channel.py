from odoo import _, models
from odoo.exceptions import AccessError


class DiscussChannel(models.Model):
    _inherit = "discuss.channel"

    def _portal_user_has_access(self, user=None):
        self.ensure_one()
        user = user or self.env.user
        if user._is_internal():
            return True
        if not user._is_portal():
            return False
        return bool(
            self.env["discuss.channel.member"]
            .sudo()
            .search_count(
                [
                    ("channel_id", "=", self.id),
                    ("partner_id", "=", user.partner_id.id),
                ]
            )
        )

    def _portal_check_access(self, user=None):
        user = user or self.env.user
        if user._is_internal():
            return self
        if not user._is_portal() or not all(
            channel._portal_user_has_access(user) for channel in self
        ):
            raise AccessError(
                _("You are not allowed to access this discussion channel.")
            )
        return self

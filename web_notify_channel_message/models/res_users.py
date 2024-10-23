from odoo import models


class ResUsers(models.Model):
    _inherit = "res.users"

    def _notify_channel(
        self,
        type_message="default",
        message="Default message",
        title=None,
        sticky=False,
        target=None,
    ):
        if self.env.context.get("_notify_channel_message", False):
            return super(ResUsers, self.sudo())._notify_channel(
                type_message=type_message,
                message=message,
                title=title,
                sticky=sticky,
                target=target,
            )
        return super()._notify_channel(
            type_message=type_message,
            message=message,
            title=title,
            sticky=sticky,
            target=target,
        )

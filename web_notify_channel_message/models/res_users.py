from odoo import models

from odoo.addons.web_notify.models.res_users import DEFAULT, DEFAULT_MESSAGE


class ResUsers(models.Model):
    _inherit = "res.users"

    def _notify_channel(
        self,
        type_message=DEFAULT,
        message=DEFAULT_MESSAGE,
        title=None,
        sticky=False,
        params=None,
    ):
        if self.env.context.get("_notify_channel_message", False):
            return super(ResUsers, self.sudo())._notify_channel(
                type_message=type_message,
                message=message,
                title=title,
                sticky=sticky,
                params=params,
            )
        return super(ResUsers, self)._notify_channel(
            type_message=type_message,
            message=message,
            title=title,
            sticky=sticky,
            params=params,
        )

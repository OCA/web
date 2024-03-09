from odoo import models


class ResUsers(models.Model):
    _inherit = "res.users"

    def _notify_channel(self, type_message, message, title, sticky):
        if self.env.context.get("_notify_channel_message", False):
            return super(ResUsers, self.sudo())._notify_channel(
                type_message=type_message, message=message, title=title, sticky=sticky
            )
        return super(ResUsers, self)._notify_channel(
            type_message=type_message, message=message, title=title, sticky=sticky
        )

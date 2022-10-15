# Copyright 2016 ACSONE SA/NV
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

from odoo import _, models

DEFAULT_MESSAGE = "Default message"
SUCCESS = "success"
DANGER = "danger"
WARNING = "warning"
INFO = "info"
DEFAULT = "info"


class ResUsers(models.Model):
    _inherit = "res.users"

    def notify_success(
        self,
        message="Default message",
        title="Default Title",
        sticky=False,
        **kwargs
    ):
        title = title or _("Success")
        self._notify_channel(SUCCESS, message, title, sticky)

    def notify_danger(
        self,
        message="Default message",
        title="Default Title",
        sticky=False,
        **kwargs
    ):
        title = title or _("Danger")
        self._notify_channel(DANGER, message, title, sticky)

    def notify_warning(
        self,
        message="Default message",
        title="Default Title",
        sticky=False,
        **kwargs
    ):
        title = title or _("Warning")
        self._notify_channel(WARNING, message, title, sticky, notify_ui, beep)

    def notify_info(
        self,
        message="Default message",
        title="Default Title",
        sticky=False,
        **kwargs
    ):
        title = title or _("Information")
        self._notify_channel(INFO, message, title, sticky)

    def notify_default(
        self,
        message="Default message",
        title="Default Title",
        sticky=False,
        **kwargs
    ):
        title = title or _("Default")
        self._notify_channel(DEFAULT, message, title, sticky)

    def _notify_channel(
        self,
        type_message=DEFAULT,
        message=DEFAULT_MESSAGE,
        title="Default Title",
        sticky=False,
        notify_ui="odoo",
        beep=False,
    ):
        self.env["bus.bus"]._sendmany(
            [
                (
                    user.partner_id,
                    "web_notify_channel",
                    {
                        "title": _(title),
                        "type_message": type_message,
                        "message": _(message),
                        "sticky": sticky,
                    },
                )
                for user in self
            ]
        )

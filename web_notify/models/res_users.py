# pylint: disable=missing-docstring
# Copyright 2016 ACSONE SA/NV
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

from odoo import _, exceptions, models

DEFAULT_MESSAGE = "Default message"

SUCCESS = "success"
DANGER = "danger"
WARNING = "warning"
INFO = "info"


class ResUsers(models.Model):
    _inherit = "res.users"

    def notify_success(self, message="Default message", title=None, sticky=False):
        title = title or _("Success")
        self._notify_channel(SUCCESS, message, title, sticky)

    def notify_danger(self, message="Default message", title=None, sticky=False):
        title = title or _("Danger")
        self._notify_channel(DANGER, message, title, sticky)

    def notify_warning(self, message="Default message", title=None, sticky=False):
        title = title or _("Warning")
        self._notify_channel(WARNING, message, title, sticky)

    def notify_info(self, message="Default message", title=None, sticky=False):
        title = title or _("Information")
        self._notify_channel(INFO, message, title, sticky)

    def _notify_channel(
        self, type_message, message=DEFAULT_MESSAGE, title=None, sticky=False
    ):
        # pylint: disable=protected-access
        if not self.env.user._is_admin() and any(
            user.id != self.env.uid for user in self
        ):
            raise exceptions.UserError(
                _("Sending a notification to another user is forbidden.")
            )
        bus_message = {
            "type": type_message,
            "message": message,
            "title": title,
            "sticky": sticky,
        }
        notifications = [
            (self.partner_id, "web_notify_" + type_message, bus_message)
            for record in self
        ]
        self.env["bus.bus"]._sendmany(notifications)

# pylint: disable=missing-docstring
# Copyright 2016 ACSONE SA/NV
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

from odoo import _, api, exceptions, fields, models

DEFAULT_MESSAGE = "Default message"

SUCCESS = "success"
DANGER = "danger"
WARNING = "warning"
INFO = "info"
DEFAULT = "default"


class ResUsers(models.Model):
    _inherit = "res.users"

    @api.depends("create_date")
    def _compute_channel_names(self):
        for record in self:
            res_id = record.id
            record.notify_success_channel_name = "notify_success_%s" % res_id
            record.notify_danger_channel_name = "notify_danger_%s" % res_id
            record.notify_warning_channel_name = "notify_warning_%s" % res_id
            record.notify_info_channel_name = "notify_info_%s" % res_id
            record.notify_default_channel_name = "notify_default_%s" % res_id

    notify_success_channel_name = fields.Char(compute="_compute_channel_names")
    notify_danger_channel_name = fields.Char(compute="_compute_channel_names")
    notify_warning_channel_name = fields.Char(compute="_compute_channel_names")
    notify_info_channel_name = fields.Char(compute="_compute_channel_names")
    notify_default_channel_name = fields.Char(compute="_compute_channel_names")

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

    def notify_default(self, message="Default message", title=None, sticky=False):
        title = title or _("Default")
        self._notify_channel(DEFAULT, message, title, sticky)

    def _notify_channel(
        self, type_message=DEFAULT, message=DEFAULT_MESSAGE, title=None, sticky=False
    ):
        # pylint: disable=protected-access
        if not self.env.user._is_admin() and any(
            user.id != self.env.uid for user in self
        ):
            raise exceptions.UserError(
                _("Sending a notification to another user is forbidden.")
            )
        channel_name_field = "notify_{}_channel_name".format(type_message)
        bus_message = {
            "type": type_message,
            "message": message,
            "title": title,
            "sticky": sticky,
        }
        notifications = [(record[channel_name_field], bus_message) for record in self]
        self.env["bus.bus"].sendmany(notifications)

# Copyright 2024 Akretion (http://www.akretion.com).
# @author Florian Mounier <florian.mounier@akretion.com>
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).
import logging

from odoo import api, models

_logger = logging.getLogger(__name__)


class IrModelData(models.Model):
    _inherit = "ir.model.data"

    @api.model
    def _process_end(self, modules):
        # This function is called at the end of the module installation
        # only if at least a module has been installed or updated.
        rv = super()._process_end(modules)
        self._notify_active_users_of_upgrade()
        return rv

    def _get_active_users_to_notify_of_upgrade(self):
        """Return the users to notify of the upgrade."""
        # Find users who are currently online or away
        online_presences = self.env["mail.presence"].search(
            [("status", "in", ("online", "away"))]
        )
        users = online_presences.mapped("user_id")
        # Respect Do Not Disturb (busy status)
        return users.filtered(lambda u: u.manual_im_status != "busy")

    def _notify_active_users_of_upgrade(self):
        # Look for active users
        active_users = self._get_active_users_to_notify_of_upgrade()
        if active_users:
            _logger.info(
                "Installation detected. Notifying %s active users", len(active_users)
            )
            # Notify them using the web_notify mechanism
            active_users.notify_info(**self._get_upgrade_notification_params())

    def _get_upgrade_notification_params(self):
        """Return the parameters to pass to the notify_info method."""
        return dict(
            message=self.env._(
                "Your odoo instance has been upgraded, please reload the web page."
            )
            + "<br />"
            '<button onclick="location.reload(true)" class="btn btn-primary mt-4">'
            '<i class="fa fa-refresh"></i>' + self.env._("Reload") + "</button>",
            title=self.env._("Upgrade Notification"),
            sticky=True,
        )

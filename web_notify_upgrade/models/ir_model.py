# Copyright 2024 Akretion (http://www.akretion.com).
# @author Florian Mounier <florian.mounier@akretion.com>
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).
import logging

from odoo import _, api, models

from odoo.addons.bus.models.bus_presence import AWAY_TIMER, DISCONNECTION_TIMER

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

    def _notify_active_users_of_upgrade(self):
        # Look for active users
        active_users = self._get_active_users_to_notify_of_upgrade()
        if active_users:
            _logger.info(
                "Installation detected. Notifying %s active users", len(active_users)
            )
            # Notify them
            active_users.notify_info(**self._get_upgrade_notification_params())

    def _get_active_users_to_notify_of_upgrade(self):
        """Return the active users that should be notified of the upgrade."""
        self.env.cr.execute(
            """
            SELECT user_id
            FROM bus_presence
            WHERE last_poll is not null
                AND (
                    age(now() AT TIME ZONE 'UTC', last_poll) < interval %s
                    OR age(now() AT TIME ZONE 'UTC', last_presence) < interval %s
                )
        """,
            ("%s seconds" % DISCONNECTION_TIMER, "%s seconds" % AWAY_TIMER),
        )
        return self.env["res.users"].browse([res[0] for res in self.env.cr.fetchall()])

    def _get_upgrade_notification_params(self):
        """Return the parameters to pass to the notify_info method."""
        return dict(
            message=_(
                "Your odoo instance has been upgraded, " "please reload the web page."
            )
            + "<br />"
            '<button onclick="location.reload(true)" class="btn btn-primary mt-4">'
            '<i class="fa fa-refresh"></i>' + _("Reload") + "</button>",
            title=_("Upgrade Notification"),
            sticky=True,
        )

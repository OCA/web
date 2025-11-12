# Copyright 2025 Cetmix OÜ
# License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl).

from odoo import models


class ResUsers(models.Model):
    _inherit = "res.users"

    def reload_views(self, model, view_types=None, rec_ids=None):
        """
        Trigger UI reload for selected users and record IDs.

        This method allows to reload specific views from the backend.
        Be aware that when reloading form views, if a user is currently
        doing some updates, those updates may be lost.

        :param model: str, Model name (e.g., 'res.partner')
        :param view_types: list of str, optional, View types to reload
                          (e.g., ['form', 'kanban']). Leave blank to reload all views.
        :param rec_ids: list of int, optional, View will be reloaded only if a record
                       with id from the list is present in the view.

        Example usage:
            # Reload the kanban and form views for all salespeople when an opportunity is won
            # Will reload views only if the current opportunity is being displayed
            group_id = self.env.ref("sales_team.group_sale_salesman").id
            users_to_reload = self.env["res.users"].search(
                [("groups_id", "in", [group_id])]
            )
            users_to_reload.reload_views(
                model="crm.lead",
                view_types=["kanban", "form"],
                rec_ids=[self.id]
            )
        """

        # Prepare the message payload
        bus_message = {
            "model": model,
            "view_types": view_types or [],
            "rec_ids": rec_ids or [],
        }

        # Send notification to each user's partner
        notifications = [
            [user.partner_id, "web.refresh_view", bus_message] for user in self
        ]
        self.env["bus.bus"]._sendmany(notifications)

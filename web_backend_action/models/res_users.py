# Copyright 2025 Dinar Gabbasov <git.diga@gmail.com>
# License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl).

from odoo import models

from odoo.addons.web.controllers.utils import clean_action


class ResUsers(models.Model):
    _inherit = "res.users"

    def _send_action(self, action, res_model=None, res_id=None, view_types=None):
        """
        Send an action to each user to webclient.

        :param dict action: Standard Odoo action definition to be executed in
            the web client.
        :param str res_model: Optional model name tag. The webclient can compare
            this value with the current controller's ``resModel`` and only run
            the action when they match.
        :param int res_id: Optional record ID. The web client can compare this
            value with the current controller's ``resId`` and only run the
            action when they match.
        :param list[str] view_types: Optional list of allowed view types
            (e.g. ``["form", "list", "kanban"]``). The webclient can use this
            list to restrict execution to specific view types. If ``None`` or
            empty, no view-type restriction is applied.
        :return bool: ``True`` if a message was sent, or ``None`` when no
            action was provided.
        """
        if not action:
            return

        clean = clean_action(action, self.env)
        message = {
            "action": clean,
            "res_model": res_model,
            "res_id": res_id,
            "view_types": view_types or [],
        }
        for user in self:
            user._bus_send("web.backend_action", message)

        return True

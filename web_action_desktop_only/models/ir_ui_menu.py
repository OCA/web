# Copyright 2026 Heligrafics
# License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl).

from odoo import models


class IrUiMenu(models.Model):
    _inherit = "ir.ui.menu"

    def load_web_menus(self, debug):
        """Extend menu data with desktop_only and main_action flags.

        These flags are consumed by the frontend to hide certain menus
        on small screen devices and to determine the app entry point
        when some child menus are filtered out.
        """
        web_menus = super().load_web_menus(debug)
        self._enrich_menus_with_action_flags(web_menus)
        return web_menus

    def _enrich_menus_with_action_flags(self, web_menus):
        """Inject desktopOnly and mainAction flags into leaf menu entries.

        Reads desktop_only and main_action from the corresponding action
        records and writes them directly into the web_menus payload dict.
        """
        actions_by_model = {}
        for menu in web_menus.values():
            action_id = menu.get("actionID")
            action_model = menu.get("actionModel")
            if action_id and action_model and not menu.get("children"):
                actions_by_model.setdefault(action_model, set()).add(action_id)

        actions_data = {}
        for model_name, ids in actions_by_model.items():
            model = self.env[model_name]
            for record in (
                model.sudo().browse(list(ids)).read(["main_action", "desktop_only"])
            ):
                actions_data[record["id"]] = (
                    record["main_action"],
                    record["desktop_only"],
                )

        for menu in web_menus.values():
            action_data = actions_data.get(menu.get("actionID"))
            if action_data:
                menu["mainAction"], menu["desktopOnly"] = action_data

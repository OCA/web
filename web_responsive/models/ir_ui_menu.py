# -*- coding: utf-8 -*-
from odoo import api, models


class IrUiMenu(models.Model):
    _inherit = 'ir.ui.menu'

    @api.model
    def search(self, args, offset=0, limit=None, order=None, count=False):
        """The filtering that is done on the menus by upstream doesn't take into account
        the visibility of their ancestors to decide if the menu is visible or not, which
        is needed for the AppDrawer menu search.
        """
        menus = super(IrUiMenu, self).search(
            args, offset=offset, limit=limit, order=order, count=count
        )
        if menus and not count and self.env.context.get("responsive_search"):
            accesible_menus = self.env["ir.ui.menu"]
            full_menus = self.with_context(responsive_search=False).search([])
            for menu in menus:
                add = True
                parent_menu = menu.parent_id
                while parent_menu:
                    if parent_menu not in full_menus:
                        add = False
                        break
                    parent_menu = parent_menu.parent_id
                if add:
                    accesible_menus += menu
            menus = accesible_menus
        return menus

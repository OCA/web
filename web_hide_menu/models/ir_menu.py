# Copyright (C) 2021 Open Source Integrators
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

from odoo import api, models


class IrUiMenu(models.Model):
    _inherit = "ir.ui.menu"

    @api.model
    def search(self, args, offset=0, limit=None, order=None, count=False):
        if self.env.user == self.env.ref("base.user_root"):
            return super(IrUiMenu, self).search(
                args, offset=offset, limit=limit, order=order, count=False
            )
        else:
            menu_ids = super(IrUiMenu, self).search(
                args, offset=offset, limit=limit, order=order, count=False
            )
            if menu_ids:

                hide_menu_ids = self.env.user.hide_menu_ids.mapped("menu_id").ids
                menu_ids = set(menu_ids.ids).difference(set(hide_menu_ids))
                return self.browse(menu_ids)
            return menu_ids

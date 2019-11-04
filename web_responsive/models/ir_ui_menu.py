from odoo import models, api

from odoo.http import request


class IrUiMenu(models.Model):
    _inherit = "ir.ui.menu"

    @api.multi
    def _visibility_parent_filter(self, debug=False):
        groups = self.env.user.groups_id
        if not debug:
            groups = groups - self.env.ref("base.group_no_one")
        return self.filtered(
            lambda menu: (not menu.groups_id or menu.groups_id & groups)
            and (
                not menu.parent_id
                or menu.parent_id._visibility_parent_filter(debug)
            )
        ).ids

    @api.multi
    @api.returns("self")
    def _filter_visible_menus1(self):
        menus = super(IrUiMenu, self)._filter_visible_menus()
        visible_ids = self._visibility_parent_filter(request and request.debug)
        return menus.filtered(lambda menu: menu.id in visible_ids)

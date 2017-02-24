# -*- coding: utf-8 -*-
from openerp import models, api


class IrUiView(models.Model):
    _inherit = 'ir.ui.menu'

    @api.multi
    def unlink(self):
        res = super(IrUiView, self).unlink()
        shortcuts = self.env['web.shortcut'].search([('menu_id', '=', False)])
        shortcuts.unlink()
        return res

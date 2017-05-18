# -*- coding: utf-8 -*-
# Copyright 2004-today Odoo SA (<http://www.odoo.com>)
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

from odoo import models, api


class IrUiView(models.Model):
    _inherit = 'ir.ui.menu'

    @api.multi
    def unlink(self):
        res = super(IrUiView, self).unlink()
        shortcuts = self.env['web.shortcut'].search([('menu_id', '=', False)])
        shortcuts.unlink()
        return res

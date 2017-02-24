from openerp import models, fields, api


class IrUiView(models.Model):
    _inherit = 'ir.ui.menu'

    @api.multi
    def unlink(self):
        res = super(IrUiView, self).unlink()
        shortcuts = self.env['web.shortcut'].search([('menu_id', '=', False)])
        for shortcut in shortcuts:
            shortcut.unlink()
        return res

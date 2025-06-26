from odoo import models


class IrModule(models.Model):
    _inherit = "ir.module.module"

    def button_install(self):
        res = super().button_install()
        self.env["res.company"].search([]).scss_create_or_update_attachment()
        return res

    def button_uninstall(self):
        res = super().button_uninstall()
        self.env["res.company"].search([]).with_context(
            uninstall_scss=True
        ).scss_create_or_update_attachment()
        return res

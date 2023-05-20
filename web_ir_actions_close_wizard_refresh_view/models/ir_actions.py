from odoo import fields, models


class IrActionsCloseWizardRefreshView(models.Model):
    _name = "ir.actions.close_wizard_refresh_view"
    _description = "Action Close Wizard Window Refresh View"
    _inherit = "ir.actions.act_window_close"
    _table = "ir_actions"

    type = fields.Char(default="ir.actions.close_wizard_refresh_view")

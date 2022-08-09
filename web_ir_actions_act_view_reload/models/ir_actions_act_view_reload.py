from odoo import models


class IrActionsActViewReload(models.Model):
    _name = "ir.actions.act_view_reload"
    _inherit = "ir.actions.actions"
    _description = "View Reload"

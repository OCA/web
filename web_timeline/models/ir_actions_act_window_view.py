from odoo import fields, models
from .ir_view import TIMELINE_VIEW

class IrActionsActWindowView(models.Model):
    _inherit = 'ir.actions.act_window.view'

    view_mode = fields.Selection(
        selection_add=[TIMELINE_VIEW]
    )

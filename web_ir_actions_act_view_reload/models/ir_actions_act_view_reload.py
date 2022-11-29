from odoo import models


class IrActionsActViewReload(models.AbstractModel):
    _name = "ir.actions.act_view_reload"
    _description = "View Reload"

    def _get_readable_fields(self):
        return self.env["ir.actions.actions"]._get_readable_fields()

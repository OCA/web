# Part of Odoo. See LICENSE file for full copyright and licensing details.

from odoo import api, models


class IrActionsActMulti(models.AbstractModel):
    """Action type of the action dicts returned by Python, handled by the
    web client. No records are stored: the server only needs the model to
    clean the returned action (web.controllers.utils.clean_action)."""

    _name = "ir.actions.act_multi"
    _description = "Action Multi"

    @api.model
    def _get_readable_fields(self):
        return self.env["ir.actions.actions"]._get_readable_fields() | {"actions"}

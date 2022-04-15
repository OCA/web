from odoo import fields, models


class IrActionsActViewReload(models.Model):
    """
    We add this model because we got error when send message (wizard full composer)
    in helpdesk ticket form
    Traceback (most recent call last):
      File "/home/odoo/14.0/odoo/http.py", line 641, in _handle_exception
        return super(JsonRequest, self)._handle_exception(exception)
      File "/home/odoo/14.0/odoo/http.py", line 317, in _handle_exception
        raise exception.with_traceback(None) from new_cause
    KeyError: 'ir.actions.act_view_reload'KeyError: 'ir.actions.act_view_reload'
    """

    _name = "ir.actions.act_view_reload"
    _description = "Action View Reload"
    _inherit = "ir.actions.actions"
    _table = "ir_actions"

    type = fields.Char(default="ir.actions.act_view_reload")

    def _get_readable_fields(self):
        return super()._get_readable_fields() | {
            # 'effect' is not a real field of ir.actions.act_window_close but is
            # used to display the rainbowman
            "effect"
        }

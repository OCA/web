from odoo import api, fields, models


class PopupMessage(models.Model):
    _name = "popup.message"
    _rec_name = "title"
    _description = "Popup message"

    model_id = fields.Many2one(
        comodel_name="ir.model", string="Model", required=True, ondelete="cascade"
    )
    model = fields.Char(related="model_id.model")
    field_ids = fields.Many2many(
        comodel_name="ir.model.fields", required=True, string="Fields"
    )
    field_name = fields.Char(compute="_compute_field_name")
    popup_type = fields.Selection(
        string="Type",
        required=True,
        default="confirm",
        selection=[("confirm", "Confirmation"), ("alert", "Alert")],
    )
    title = fields.Char(string="Title")
    message = fields.Text(string="Message", required=True)
    active = fields.Boolean(string="Active", default=True)

    @api.depends("field_ids")
    def _compute_field_name(self):
        for message in self:
            message.field_name = ",".join(f.name for f in message.field_ids)

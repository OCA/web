from odoo import fields, models


class BusRecordEventDemo(models.Model):
    _name = "bus.record.event.demo"
    _description = "Bus Record Event Demo Model"
    _inherit = ["bus.record.event.mixin"]

    name = fields.Char(required=True)
    description = fields.Text()
    user_id = fields.Many2one(
        "res.users", string="User", default=lambda self: self.env.user
    )
    date = fields.Date(default=fields.Date.context_today)
    value = fields.Float(default=0.0)
    state = fields.Selection(
        [("draft", "Draft"), ("confirmed", "Confirmed"), ("done", "Done")],
        default="draft",
    )
    priority = fields.Selection(
        [("0", "Low"), ("1", "Normal"), ("2", "High")],
        default="0",
    )

# Copyright 2023 Tecnativa - David Vidal
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).
from odoo import fields, models


class RemoteMeasureDevice(models.Model):
    _name = "remote.measure.device"
    _description = "Remote measure device"

    active = fields.Boolean(default=True)
    name = fields.Char(required=True)
    uom_id = fields.Many2one(
        string="Unit of measure",
        comodel_name="uom.uom",
        required=True,
    )
    uom_category_id = fields.Many2one(related="uom_id.category_id")
    uom_factor = fields.Float(related="uom_id.factor")
    protocol = fields.Selection(
        selection=[("f501", "Scale F501")],
        help="Operating protocol",
        required=True,
    )
    connection_mode = fields.Selection(
        selection=[
            ("websockets", "Web Sockets"),
            ("webservices", "Web Services"),
        ],
        required=True,
    )
    host = fields.Char(required=True)
    test_measure = fields.Float(default=0.0)

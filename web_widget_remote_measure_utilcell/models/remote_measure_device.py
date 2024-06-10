# Copyright 2023 Tecnativa - David Vidal
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).
from odoo import fields, models


class RemoteMeasureDevice(models.Model):
    _inherit = "remote.measure.device"

    protocol = fields.Selection(
        selection_add=[
            ("utilcell_f10", "Utilcell F10"),
            ("utilcell_f16", "Utilcell F16"),
        ],
        ondelete={"utilcell_f10": "cascade", "utilcell_f16": "cascade"},
    )

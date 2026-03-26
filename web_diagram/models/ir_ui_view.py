# Part of Odoo. See LICENSE file for full copyright and licensing details.

from odoo import fields, models

DIAGRAM_VIEW = ("diagram", "Diagram")


class IrUIView(models.Model):
    _inherit = "ir.ui.view"

    type = fields.Selection(selection_add=[DIAGRAM_VIEW])

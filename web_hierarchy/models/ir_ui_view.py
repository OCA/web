# -*- coding: utf-8 -*-
#   Copyright 2019 Kevin Kamau
#   License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).
from odoo import fields, models, _


class IrUiView(models.Model):
    _inherit = 'ir.ui.view'

    type = fields.Selection(selection_add=[('hierarchy', 'Hierarchy')])

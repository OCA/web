# Copyright 2020 Tecnativa - Alexandre D. Díaz
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).
from odoo import models, fields


class View(models.Model):
    _inherit = 'ir.ui.view'

    type = fields.Selection(selection_add=[('formPWA', "Form PWA")])

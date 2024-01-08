# -*- coding: utf-8 -*-
# Copyright (C) 2015-TODAY Akretion (<http://www.akretion.com>).
# © 2017 Therp BV <http://therp.nl>
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
from odoo import models, fields


class IrActionsActwindow(models.Model):
    _inherit = 'ir.actions.act_window'

    enduser_help = fields.Html(
        string="End User Help",
        help='Use this field to add custom content for documentation purpose '
             'mainly by power users.')
    advanced_help = fields.Text(
        string="Advanced Help",
        help='Use this field to add custom content for documentation purpose '
             'mainly by developers')

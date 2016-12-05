# coding: utf-8
##############################################################################
#
#    Odoo, Open Source Management Solution
#    Copyright (C) 2015-TODAY Akretion (<http://www.akretion.com>).
#
#    This program is free software: you can redistribute it and/or modify
#    it under the terms of the GNU Affero General Public License as
#    published by the Free Software Foundation, either version 3 of the
#    License, or (at your option) any later version.
#
#    This program is distributed in the hope that it will be useful,
#    but WITHOUT ANY WARRANTY; without even the implied warranty of
#    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
#    GNU Affero General Public License for more details.
#
#    You should have received a copy of the GNU Affero General Public License
#    along with this program.  If not, see <http://www.gnu.org/licenses/>.
#
##############################################################################

from openerp import models, fields


class IrActionsActwindow(models.Model):
    _inherit = 'ir.actions.act_window'

    enduser_help = fields.Html(
        string="End User Help",
        help="Use this field to add custom content for documentation purpose\n"
             "mainly by power users ")
    advanced_help = fields.Text(
        string="Advanced Help",
        help="Use this field to add custom content for documentation purpose\n"
             "mainly by developers")

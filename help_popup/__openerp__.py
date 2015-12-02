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
#    along with this program. If not, see <http://www.gnu.org/licenses/>.
#
##############################################################################

{
    'name': 'Help Popup',
    'version': '8.0.0.5.0',
    'author': 'Akretion, Odoo Community Association (OCA)',
    'depends': [
        'web',
    ],
    'website': 'https://www.akretion.com',
    'data': [
        'views/popup_help_view.xml',
        'views/action_view.xml',
        'report/report.xml',
        'report/help.xml',
    ],
    'demo': [
        'demo/help.xml',
    ],
    'qweb': [
        'static/src/xml/popup_help.xml',
    ],
    'installable': False,
}

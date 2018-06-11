##############################################################################
#
#    OpenERP, Open Source Management Solution
#    Copyright (C) 2018 Alexandre Díaz <dev@redneboa.es>
#
#    This program is free software: you can redistribute it and/or modify
#    it under the terms of the GNU General Public License as published by
#    the Free Software Foundation, either version 3 of the License, or
#    (at your option) any later version.
#
#    This program is distributed in the hope that it will be useful,
#    but WITHOUT ANY WARRANTY; without even the implied warranty of
#    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
#    GNU General Public License for more details.
#
#    You should have received a copy of the GNU General Public License
#    along with this program.  If not, see <http://www.gnu.org/licenses/>.
#
##############################################################################

{
    'name': 'Web Chatter Right',
    'version': '11.0.1.0.0',
    'author': "Odoo Community Association (OCA), Alexandre Díaz <dev@redneboa.es>",
    'website': '',
    'category': 'web/theme',
    'summary': "Put chatter right",
    'depends': [
        'mail',
    ],
    'data': [
        'views/general.xml',
    ],
    'qweb': [],
    'test': [
    ],

    'installable': True,
    'auto_install': False,
    'application': False,
    'license': 'AGPL-3',
}

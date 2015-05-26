##############################################################################
#
#    OpenERP, Open Source Management Solution
#    Copyright (C) 2015 FactorLibre (http://www.factorlibre.com)
#                  Hugo Santos <hugo.santos@factorlibre.com>
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
{
    'name': "Web Extended Email Widget",
    'description': "Allows to add cc, bcc, subject to email links",
    'category': "Web",
    'version': "1.0",
    'license': 'AGPL-3',
    'author': 'FactorLibre, Odoo Community Association (OCA)',
    'website': 'http://factorlibre.com',
    'depends': ['web'],
    'data': [
        'view/web_extended_email_widget_view.xml',
    ],
    'auto_install': False,
    'installable': True
}

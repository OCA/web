# -*- encoding: utf-8 -*-
##############################################################################
#
#    OpenERP, Open Source Management Solution
#    This module copyright (C) 2013 Therp BV (<http://therp.nl>)
#    All Rights Reserved
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
    'name': 'Hide OpenERP controls while printing',
    'version': '1.0',
    'description': """ This addons provides a stylesheet that removes the menu
    and controls when printing an OpenERP screen through the browser's print
    button.""",
    'author': 'Therp BV',
    'website': 'http://www.therp.nl',
    "category": "Tools",
    "depends": [
        'web',
        ],
    'css': [
        'static/src/css/web_print_from_browser.css',
        ],
    'data': [
        ],
    'js': [
        ],
    'installable': True,
    'active': False,
    'certificate': '',
}

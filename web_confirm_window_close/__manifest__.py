# -*- coding: utf-8 -*-
##############################################################################
#
#    OpenERP, Open Source Management Solution
#    This module copyright (C) 2013 Therp BV (<http://therp.nl>).
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
    'name': 'Check for unsaved data when closing browser window',
    'description': '''
This addon will show a confirmation dialog when the user closes
a window with an OpenERP form containing unsaved data.

This functionality is browser dependent. Opera ignores it at all,
while Firefox displays a generic confirmation message.

This module is compatible with OpenERP 7.0.
''',
    'version': '7.0.1',
    'author': "Therp BV,Odoo Community Association (OCA)",
    'category': 'Usability',
    'website': 'https://launchpad.net/web-addons',
    'license': 'AGPL-3',
    'installable': False,
    'depends': [
        'web',
        ],
    'js': [
        'static/src/js/web_confirm_window_close.js'
        ],
}

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
    'name': 'Open URLs in new tab',
    'description': '''
This module adds target=_blank to the URL widget in readonly mode.

This module is compatible with OpenERP 6.1.
''',
    'version': '6.1.1',
    'author': 'Therp BV',
    'category': 'Usability',
    'website': 'http://therp.nl',
    'email': 'info@therp.nl',
    'license': 'AGPL-3',
    'depends': [
        'web',
        ],
    'js': [
        'static/src/js/web_url_target_new.js'
        ],
}

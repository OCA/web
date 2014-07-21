# -*- encoding: utf-8 -*-
##############################################################################
#
#    Copyright (C) 2013 Therp B.V. (<http://www.therp.nl>)
#
#    This program is free software: you can redistribute it and/or modify
#    it under the terms of the GNU Affero General Public License as published
#    by the Free Software Foundation, either version 3 of the License, or
#    (at your option) any later version.
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
    'name': 'web hide buttons',
    'application': False,
    'version': '6.1.r003',
    'category': 'Web',
    'description': '''
This module makes it possible to hide Create and Delete buttons from the
user, if requested through the context of the action defining the window.
To hide both buttons add the following element to the xml for the
ir.actions.act_window:
<field name="context">{'nodelete': '1', 'nocreate': '1'}</field>
''',
    'author': 'Therp BV',
    'website': 'http://www.therp.nl',
    'license': 'AGPL-3',
    'depends': [
        'web',
    ],
    'init_xml': [],
    'update_xml': [],
    'demo_xml': [],
    'installable': True,
    'js': ['static/src/js/web_hide_buttons.js'],
    }

# -*- encoding: utf-8 -*-
##############################################################################
#
#    OpenERP, Open Source Management Solution
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
    'name': 'Bootstrap Toggle Widget',
    'version': '8.0.1.0.0',
    'author': "aimsystems,Odoo Community Association (OCA)",
    'license': 'AGPL-3',
    'website': 'https://github.com/OCA/web',
    'summary': 'Odoo Checkbox Toggle Widget',
    'category': 'Tools',
    'description':
        """
Checkbox Toggle Widget
=================
Turns ordinary checkboxes(booleans) into switches very similar to settings on most modern phones. Instead of simply 
displaying checked or not checked you now have the options of 'On' or 'Off', 'Yes' or 'No', 'True' or 'False'. Really
the possibilities are endless as you can configure the toggle widget to use whatever colours or words you wish.
        """,
    'data': [
        "toggle_widget.xml",
    ],
    'depends': ['base','web'],
    'qweb': ['static/src/xml/*.xml'],
    'installable':True,
}

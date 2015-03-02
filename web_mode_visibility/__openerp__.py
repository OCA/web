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
    "name": "Visibility depending on view mode",
    "version": "6.1.1.0r1",
    "author": "Therp BV,Odoo Community Association (OCA)",
    "category": "Tools",
    "depends": ['web'],
    "description": """
Use the following boolean switches in the options dictionary on fields to hide
them in either page or form mode:

- page_invisible
- form_invisible

For example:

<field name="partner_id" options='{"page_invisible": true}' />

This module is compatible with OpenERP 6.1.
    """,
    'js': [
        'static/src/js/web_mode_visibility.js',
        ],
}

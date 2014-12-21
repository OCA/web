# -*- encoding: utf-8 -*-
##############################################################################
#
#    OpenERP, Open Source Management Solution
#
#    Copyright (c) 2014 Noviat nv/sa (www.noviat.com). All rights reserved.
#
#    This program is free software: you can redistribute it and/or modify
#    it under the terms of the GNU Affero General Public License as
#    published by the Free Software Foundation, either version 3 of the
#    License, or (at your option) any later version.
#
#    This program is distributed in the hope that it will be useful,
#    but WITHOUT ANY WARRANTY; without even the implied warranty of
#    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
#    GNU Affero General Public License for more details.
#
#    You should have received a copy of the GNU Affero General Public License
#    along with this program. If not, see <http://www.gnu.org/licenses/>.
#
##############################################################################

{
    'name': 'Show selected sheets with full width',
    'version': '0.1',
    'license': 'AGPL-3',
    'author': 'Noviat',
    'category': 'Hidden',
    'description': """
Description
-----------
This module adds a css class to change a Form Sheet view
to cover the full screen.

You can activate the Full Screen view by the creation of an
inherited view with the following content:
::

    <xpath expr="//sheet" position="attributes">
        <attribute name="class">oe_form_sheet_full_screen</attribute>
    </xpath>

Install the 'web_sheet_full_width' module if you want to have a full screen
behaviour in all sheets.


Acknowledgements
----------------
Icon courtesy of http://www.picol.org/ (size_width.svg)
    """,
    'depends': [
        'web',
    ],
    'data': [
        'views/sheet.xml',
    ],
    'active': False,
    'installable': True,
    }

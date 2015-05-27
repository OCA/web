# -*- coding: utf-8 -*-
##############################################################################
#
#    OpenERP, Open Source Management Solution
#    Copyright (C) 2010-2015 OpenERP s.a. (<http://openerp.com>).
#    Copyright (C) 2015 initOS GmbH & Co. KG (<http://www.initos.com>).
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
    'name': 'Web text limited widget',
    'version': '0.1.0',
    'author': 'initOS GmbH & Co. KG',
    'category': '',
    'description': """

* Add new 'text_limited' widget for TextField, but data are limited to
10 lines or 500 characters (by default).
You can change default values by context varibles 'limit_lines' and
'limit_chars'.
If data contains more characters or lines, it will be cut.
Example of usage:
<field name="some_text_field"
       widget="text_limited"
       context="{'limit_lines': 8, 'limit_chars': 400}"
/>
""",
    'website': 'http://www.initos.com',
    'license': 'AGPL-3',
    'images': [],
    'depends': [
        'web',
    ],
    'data': [],
    'update_xml': [],
    'js': [
        'static/src/js/text_limited.js',
    ],
    'qweb': [
        'static/src/xml/text_limited.xml',
    ],
    'css': [
        'static/src/css/text_limited.css',
    ],
    'demo': [],
    'test': [],
    'active': False,
    'installable': True,
    'auto_install': True,
}

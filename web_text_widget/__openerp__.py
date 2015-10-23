# -*- coding: utf-8 -*-
##############################################################################
#
#    OpenERP, Open Source Management Solution
#    Copyright (C) 2010-2015 OpenERP s.a. (<http://openerp.com>).
#    Copyright (C) 2015 initOS GmbH (<http://www.initos.com>).
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
    'version': '7.0.1.0.0',
    'author': 'initOS GmbH & Co. KG',
    'category': 'web',
    'description': """

* Add new functionality for TextField.
You can change default values by context varibles 'maxlines' and
'maxlength'.
If data contains more characters or lines, it will be cut.
Example of usage:
<field name="some_text_field"
       context="{'maxlines': 8, 'maxlength': 400}"
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

# -*- encoding: utf-8 -*-
##############################################################################
#
#    OpenERP, Open Source Management Solution
#    This module copyright (C) 2013-2015 Therp BV (<http://therp.nl>)
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
    'name': 'CKEditor 4.x widget',
    'version': '8.0.1.0.0',
    'author': "Therp BV,Odoo Community Association (OCA)",
    'website': 'https://github.com/OCA/web',
    'summary': 'Provides a widget for editing HTML fields using CKEditor 4.x',
    "category": "Tools",
    'license': 'AGPL-3',
    "depends": [
        'web',
    ],
    'data': [
        'views/qweb.xml',
    ],
    'css': [
        'static/src/css/web_ckeditor4.css',
    ],
    'installable': False,
    'auto_install': False,
    'certificate': '',
}

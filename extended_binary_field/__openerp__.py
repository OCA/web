# -*- coding: utf-8 -*-
##############################################################################
#
#    OpenERP, Open Source Management Solution
#    Copyright (C) 2014-2015 initOS GmbH(<http://www.initos.com>).
#    Author Nikolina Todorova <nikolina.todorova@initos.com>
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
    'name': 'Extended version of the binary field',
    'version': '0.1',
    'author': 'initOS GmbH',
    'category': '',
    'description':
    """
New version of binary field, including creation of ir_attachment object.
Use:
 1. Every class that use the field should inherit 'additional.field'.
 2. Every tree/form view should have version attribute.
 3. Every special binary field in the view
    should have attribute specialbinary="1".
 4. The versionedAttachment class
    should be imported from extended_binary_field.fields
 Create new field as follows:
    ex.:
        'test_binary': versionedAttachment('Test binary')

With appreciation to Akretion and
Sébastien BEAU <sebastian.beau@akretion.com> for inspiring us.
""",
    'website': 'http://www.initos.com',
    'license': 'AGPL-3',
    'images': [],
    'depends': [
            'base',
            'document',
            'web',
    ],
    'data': [
        'ir_attachment_view.xml'
    ],
    'js': [
        'static/src/js/delayed_binary.js',
    ],
    'qweb': [
    ],
    'css': [
    ],
    'demo': [
    ],
    'test': [
    ],
    'active': False,
    'installable': True,
    'auto_install': True,
}

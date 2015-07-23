# -*- coding: utf-8 -*-
##############################################################################
#
#    OpenERP, Open Source Management Solution
#    Copyright (C) 2010-2014 OpenERP s.a. (<http://openerp.com>).
#    Copyright (C) 2014 initOS GmbH & Co. KG (<http://www.initos.com>).
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
    'name': 'Web Note',
    'version': '0.1',
    'author': 'initOS GmbH & Co. KG',
    'category': '',
    'description':
    """
This module can be used for adding a notes field in any module that need them.
There are three type of notes - private, internal, external.
Only the user that create a private note can see it.
The other two types can be used for creating different views.
    """,
    'website': 'http://www.initos.com',
    'license': 'AGPL-3',
    'images': [],
    'depends': [],
    'data': [
        "web_note_view.xml",
        "security/web_note_security.xml",
    ],
    'js': [
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
    'installable': True
}

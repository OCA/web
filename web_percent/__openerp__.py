# -*- coding: utf-8 -*-
##############################################################################
#
#    OpenERP, Open Source Management Solution
#    Copyright (C) 2014 TeMPO Consulting (<http://www.tempo-consulting.fr>).
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
    'name': 'Percent widget',
    'category': 'Web widgets',
    'author': 'TeMPO Consulting, Therp BV',
    'description':"""
Percent widget for form and tree views
======================================

Add a percentage symbol (%) at the end of float fields
if widget="percent" is declared in XML.

Known limitations
=================
* Editable tree views are not yet supported

""",
    'version': '2.0',
    'depends': [
        "web",
    ],
    'js': [
        'static/src/js/resource.js',
    ],
    'css': [],
    'qweb': [
        'static/src/xml/percent.xml',
    ],
    'auto_install': False,
    'web_preload': False,
}

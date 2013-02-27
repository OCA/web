
# -*- coding: utf-8 -*-
##############################################################################
#
#    OpenERP, Open Source Management Solution    
#    Copyright (C) 2004-2009 Tiny SPRL (<http://tiny.be>). All Rights Reserved
#    Financed and Planified by Vauxoo
#    developed by: nhomar@vauxoo.com
#
#    This program is free software: you can redistribute it and/or modify
#    it under the terms of the GNU General Public License as published by
#    the Free Software Foundation, either version 3 of the License, or
#    (at your option) any later version.
#
#    This program is distributed in the hope that it will be useful,
#    but WITHOUT ANY WARRANTY; without even the implied warranty of
#    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
#    GNU General Public License for more details.
#
#    You should have received a copy of the GNU General Public License
#    along with this program.  If not, see <http://www.gnu.org/licenses/>.
#
##############################################################################

{
    'name': "Hide create database from login page",
    'author': "Vauxoo",
    'category': "Web",
    'description': """
    """,
    'version': "1.0",
    'depends': ['web'],
    'js': [
       # 'static/src/js/base.js', 
    ],
    'css': [
    ],
    'qweb': [
        'static/src/xml/web_nocreatedb.xml',
    ],
    'installable': True,
    'auto_install': False,
    'web_preload': True,
}

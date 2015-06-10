# -*- coding: utf-8 -*-
##############################################################################
#
#    OpenERP, Open Source Management Solution
#    Copyright (C) 2004-2010 Tiny SPRL (<http://tiny.be>).
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
    'name': 'When in display mode,Auto Refresh inbox message, Kanban and list view right after model data get changed',
    'version': '1.0',
    'author': 'Fisher','OCA'
    'website': 'https://github.com/szufisher/web',
    'category': 'hidden',
    'sequence': 100,
    'summary': 'auto refresh inbox message, kanban and list view via notification push',
    'images': [
            ],
    'depends': [
       'bus_enhanced'
    ],
    'description': """
    """,
    'data': [
        'views/web_auto_refresh.xml',
    ],
    'test': [
    ],
    'installable': True,
    'auto_install': False,
    'application': False,
    'license': 'AGPL-3',
}

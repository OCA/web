# -*- coding: utf-8 -*-
##############################################################################
#
#    OpenERP, Open Source Management Solution
#    Copyright (C) 2010-2011 OpenERP s.a. (<http://openerp.com>).
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
    'name': 'Custom Filter Tabs',
    'version': '1.0',
    'category': 'Tools',
    'summary': 'Custom Filter Tabs',
    'description': """
Converts custom filters into tabs
===========================================
A very convenient feature of OpenERP that can convert your custom filters into tabs to make searching easy and enhances your GUI experience.

    """,
    'author': 'OpenERP SA',
    'website': 'http://openerp.com',
    'depends': ['base', 'web'],
    'data': [],
    'js' : ['static/src/js/web_filter_tabs.js'],
    'css' : ['static/src/css/web_filter_tabs.css'],
    'qweb' : ['static/src/xml/*.xml'],
    'installable': True,
    'auto_install': False,
}

# vim:expandtab:smartindent:tabstop=4:softtabstop=4:shiftwidth=4:

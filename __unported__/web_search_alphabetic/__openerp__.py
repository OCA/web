# -*- coding: utf-8 -*-
##############################################################################
#
#    OpenERP, Open Source Management Solution
#    Copyright (C) 2004-2010 Tiny SPRL (<http://tiny.be>).
#    Copyright (C) 2011-2014 Serpent Consulting Services (<http://www.serpentcs.com>)
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
############################################################################

{
    'name': 'Web Alphabetical Search',
    'author' : 'Serpent Consulting Services Pvt. Ltd.',
    'category' : 'Web',
    'website': 'http://www.serpentcs.com',
    'description': """
OpenERP Web Search Extended.
============================

This module used for search record base on alphabetical character be default it will search on name field.
User also is able to change search field name instead of name field.
    """,
    'version': '1.0',
    'depends': ['web'],
    'js': [
        'static/src/js/web_search.js'
    ],
    'css': [
        'static/src/css/web_search.css'
    ],
    'qweb' : [
        'static/src/xml/web_search.xml',
    ],
    'installable': False,
    'auto_install': False
}

# vim:expandtab:smartindent:tabstop=4:softtabstop=4:shiftwidth=4:

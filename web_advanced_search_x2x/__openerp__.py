# -*- coding: utf-8 -*-
##############################################################################
#
#    OpenERP, Open Source Management Solution
#    This module copyright (C) 2015 Therp BV <http://therp.nl>.
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
    "name": "Search x2x fields",
    "version": "1.0",
    "author": "Therp BV, "
              "Odoo Community Association (OCA)",
    "description": """
Standard behavior in advanced search for one2many, many2many and many2one
fields is to do a `name_search`. This often is not satisfactionary as you
might want to search for other properties. There might also be cases where
you don't exactly know what you're searching for, then a list of possible
options is necessary too. This module enables you to have a full search view
to select the record in question, and either select specific records or select
them using a search query of its own.
Backported from 8.0 to 7.0, the same functionality that appears in the new v8
search area will appear in the v7 search dropdown.
To improve usability a small javascript modification has been introduced so
that the main search popup doesn't close when closing the advanced search
domain popups.
    """,
    "license": "AGPL-3",
    "category": "Usability",
    "summary": "Use a search widget in advanced search for x2x fields",
    "depends": [
        'web',
    ],
    "qweb": [
        'static/src/xml/web_advanced_search_x2x.xml',
    ],
    'js': ['static/src/js/*.js'],
    'css': ['static/src/css/*.css'],
    "test": [
    ],
    "auto_install": False,
    "installable": True,
    "application": False,
    "external_dependencies": {
        'python': [],
    },
}

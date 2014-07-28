# -*- coding: utf-8 -*-
##############################################################################
#
#    OpenERP, Open Source Management Solution
#    This module copyright (C) 2014 Therp BV (<http://therp.nl>).
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
    "name": "Advanced filters",
    "version": "1.0",
    "author": "Therp BV",
    "license": "AGPL-3",
    "complexity": "normal",
    "description": """
Introduction
------------

This addon allows users to apply set operations on filters: Remove or add
certain ids from/to a selection, but also to remove or add another filter's
outcome from/to a filter. This can be stacked, so the filter domain can be
arbitrarily complicated.

The math is hidden from the user as far as possible, in the hope it's still
user friendly.

Usage
-----

After this addon is installed, every list view shows a new menu 'Advanced
filters'. Here the set operations can be applied as necessary.

Caution
-------

Deinstalling this module will leave you with filters with empty domains. Use
this query before uninstalling to avoid that:

``alter table ir_filters rename domain_this to domain``
    """,
    "category": "Tools",
    "depends": [
        'base',
        'web',
    ],
    "data": [
        "wizard/ir_filters_combine_with_existing.xml",
        "view/ir_filters.xml",
    ],
    "js": [
        'static/src/js/advanced_filters.js',
    ],
    "css": [
        'static/src/css/advanced_filters.css',
    ],
    "qweb": [
    ],
    "test": [
    ],
    "auto_install": False,
    "installable": True,
    "application": False,
    "external_dependencies": {
        'python': [],
    },
}

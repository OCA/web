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
    "name": "More pythonic relativedelta",
    "version": "1.0",
    "author": "Therp BV,Odoo Community Association (OCA)",
    "license": "AGPL-3",
    "complexity": "normal",
    "description": """
Introduction
============

This addon provides a reimplementation of OpenERP's pyjs relativedelta class
using Moment.js (http://momentjs.com).

On top of what you can do with the original, you can use

- datetime objects
- relativedelta(hour=0-23, hours=0-23)
- relativedelta(minute=0-59, minutes=0-59)
- relativedelta(seconds=0-59, seconds=0-59)
- relativedelta(weekday=0) [MO] ... weekday=6 [SU]

  - there's no MO(+n) syntax, but that can be simulated by
    relativedelta(weeks=+(n-1), days=1, weekday=0), this week's monday would
    be relativedelta(weeks=-1, days=1, weekday=0) etc.

- all of them together in a predictable manner as detailed in
https://labix.org/python-dateutil#head-72c4689ec5608067d118b9143cef6bdffb6dad4e

Usage
=====

Simply depend on web_relativedelta and enjoy most of python's relativedelta
functionality
    """,
    "category": "Dependency",
    "depends": [
        'web',
        'web_lib_moment',
    ],
    "data": [
    ],
    "js": [
        'static/src/js/web_relativedelta.js'
    ],
    "css": [
    ],
    "qweb": [
    ],
    "test": [
        'static/test/web_relativedelta.js',
    ],
    "auto_install": False,
    "installable": True,
    "application": False,
    "external_dependencies": {
        'python': [],
    },
}

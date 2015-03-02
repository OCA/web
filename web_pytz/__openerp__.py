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
    "name": "pytz support for filter domains",
    "version": "1.0",
    "author": "Therp BV,Odoo Community Association (OCA)",
    "license": "AGPL-3",
    "complexity": "normal",
    "description": """
Introduction
------------
This module allows complex timezone operations in domains mimicing python's
pytz. The heavy lifting is done by http://momentjs.com/timezone.

It is meant to allow correct filters for 'Today', 'Yesterday' etc.

In addition to implementing a subset of `pytz.tzinfo` and
`datetime.astimezone`, there's a shortcut called `utc_today()` which returns
the beginning of the day in the current user's time zone translated to UTC,
this is equivalent to::

  pytz.timezone(tz).localize(datetime.datetime.now().replace(hour=0, minute=0,
      second=0)).astimezone(pytz.utc)

in python.

Usage
-----

Depend on this module and use filters like::

    [('write_date', '>=', utc_today().strftime('%Y-%m-%d %H:%M:%S'))]

which displays records changed in the user's conception of today.""",
    "category": "Dependency",
    "depends": [
        'web',
    ],
    "data": [
    ],
    "js": [
        'static/src/js/web_pytz.js',
        'static/lib/moment.min.js',
        'static/lib/moment-timezone.min.js',
    ],
    "css": [
    ],
    "qweb": [
    ],
    "test": [
        'static/test/web_pytz.js',
    ],
    "auto_install": False,
    "installable": True,
    "application": False,
    "external_dependencies": {
        'python': [],
    },
}

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
    "name": "Clickable statusbar",
    "version": "1.0",
    "author": "Therp BV",
    "license": "AGPL-3",
    "complexity": "normal",
    "description": """
This addons backports the clickable feature for statusbars in OpenERP 6.1

As with the original: Don't use this on state fields connected to a workflow,
this will mess up your workflow's state!
    """,
    "category": "Dependency",
    "depends": [
        'web',
    ],
    "data": [
    ],
    "js": [
        'static/src/js/web_statusbar_clickable.js',
    ],
    "css": [
        'static/src/css/web_statusbar_clickable.css',
    ],
    "qweb": [
        'static/src/xml/web_statusbar_clickable.xml',
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

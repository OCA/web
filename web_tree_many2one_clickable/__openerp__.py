# -*- coding: utf-8 -*-
##############################################################################
#
#    OpenERP, Open Source Management Solution
#    This module copyright (C) 2013 Therp BV (<http://therp.nl>).
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
    "name": "Clickable many2one widget for tree views",
    "version": "1.0",
    "author": "Therp BV,Odoo Community Association (OCA)",
    "complexity": "normal",
    "description": """
This addon provides a widget to have many2one fields in a tree view open the
linked resource::

<field name="partner_id" widget="many2one_clickable" />

will open the linked partner in a form view.
    """,
    "category": "Dependency",
    "depends": [
        'web',
    ],
    "data": [
    ],
    "js": [
        'static/src/js/web_tree_many2one_clickable.js',
    ],
    "css": [
    ],
    "qweb": [
    ],
    "auto_install": False,
    "installable": True,
    "external_dependencies": {
        'python': [],
    },
}

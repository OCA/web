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
    "name": "Web Hide Left Menu",
    "summary": """
Hide Left menu:
===============

This module just add a button un User Menu to hide the left menu specially useful
when you are analysing a bunch of data.

Original module by Vauxoo, Migrated to V8.0 by Ahmet Altinisik

    """,
    "version": "8.0.1.0.0",
    "category": "Hidden",
    "website": "https://odoo-community.org/",
    "author": "Vauxoo, Odoo Community Association (OCA)",
    "license": "AGPL-3",
    "application": False,
    "installable": True,
    "external_dependencies": {
        "python": [],
        "bin": [],
    },
    "depends": [
        "web",
    ],
    "js": [
        "static/src/js/lib.js",
    ],
    "css": [
        "static/src/css/lib.css",
    ],
    "qweb": [
        "static/src/xml/lib.xml",
    ]
}

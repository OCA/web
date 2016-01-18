# -*- coding: utf-8 -*-
# © Vauxoo <nhomar@vauxoo.com>
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

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

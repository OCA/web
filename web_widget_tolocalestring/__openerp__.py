# -*- coding: utf-8 -*-
# (c) 2016 Tony Galmiche / InfoSaône
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
{
    "name": "Web Widget toLocaleString",
    "summary": """
This module add 'tolocalestring' widget in tree view for formatting
numbers or not to display the values 0""",
    "description": "",
    "version": "8.0.1.0.0",
    "category": "web",
    "website": "https://odoo-community.org/",
    "author": "Tony Galmiche/InfoSaône, Odoo Community Association (OCA)",
    "license": "AGPL-3",
    "application": False,
    "installable": True,
    "external_dependencies": {
        "python": [],
        "bin": [],
    },
    "depends": [
        "base", "web",
    ],
    "data": [
        "views/assets.xml",
    ],
    "demo": [
    ],
    "qweb": [
        "static/src/xml/widget.xml",
    ]
}
